const version = 7;
const staticCacheName = `staticCache-${version}`;

const assets = [
    '/fallingsand/',
    '/fallingsand/index.html',
    '/fallingsand/main.css',
    '/fallingsand/js/app.js',
    '/fallingsand/js/sand.js',
    '/fallingsand/manifest.json',
    '/fallingsand/img/apple-touch-icon.png',
    '/fallingsand/img/android-chrome-192x192.png',
    '/fallingsand/img/android-chrome-512x512.png',
    '/fallingsand/img/favicon-16x16.png',
    '/fallingsand/img/favicon-32x32.png',
    '/fallingsand/img/Screenshot_fallingsand_319x688.png',
    '/fallingsand/img/screenshot_fallingsand_718x332.png',
    '/fallingsand/img/claydoublewave_edit_500x667.png'
];

self.addEventListener('install', (event)=> {

    //console.log(`Version ${version} installed.`);

    event.waitUntil( cacheAssets(staticCacheName) );  

});


self.addEventListener('activate', (event)=>{

    //console.log('activated');

    event.waitUntil( cleanCache(staticCacheName) );

});


self.addEventListener('message', (event)=>{

    const data = event.data;

    //console.log('SW received', data);

    if('checkOnline' in data){

        event.waitUntil( requestDataToCheckisOnline() );

    }

    if('action' in data){

        switch(data.action){

            case 'SKIP_WAITING':

                event.waitUntil( self.skipWaiting() );

            break;
        }
    }
});





self.addEventListener('fetch', (event) => {

    //console.log(`fetch request for: ${event.request.url} --- MODE: ${event.request.mode}`);

    const isOnline = self.navigator.onLine;

    //const url = new URL(event.request.url);

    // const isImage = url.pathname.match(/\.(png|jpeg|jpg|gif)$/i);

    // const isJSON = url.pathname.endsWith('.json');

    // const isCSS = url.pathname.endsWith('.css');

    // const isHTML = event.request.mode === 'navigate';

    // const isJavaScript = url.pathname.endsWith('.js');

    // const selfUrl = new URL(self.location);

    // const isExternal = event.request.mode === 'cors' || selfUrl.hostname !== url.hostname;

    if(isOnline){

        event.respondWith( staleWhileRevalidate(event, staticCacheName) );

    }else{

        event.respondWith( cacheOnly(event) );

    }

});

function cacheAssets(cacheName){

    caches.open(cacheName).then( (cache) => {

        cache.addAll(assets).then( response => {

            //console.log(`${cacheName} has been updated.`);

            return response;

        }).catch( error => {

            console.warn(`Failed to updated ${cacheName}`,error);

        });
    });


};

function cleanCache(cacheName){

    caches.keys().then( (keys) => {

        return Promise.all(

            keys.filter( (key) => key != cacheName).map( (key) => caches.delete(key))

        );

    })
};

async function sendServiceWorkerMessage(message){

    const allClients = await clients.matchAll({ includeUncontrolled: true });

    return Promise.all(

        allClients.map( (client)=> {

            if('isOnline' in message){
    
                //console.log('tell the browser if online');
            }
            
            return client.postMessage(message);

        })
    );
};

function requestDataToCheckisOnline(){

    fetch(new Request(`/fallingsand/test_online.txt`, {method: 'HEAD'})).then( ()=> {

        //console.log('Able to get the test data headers');

        return sendServiceWorkerMessage({ isOnline: true });

    }, (error)=> {

        //console.log('Failed to fetch test data headers',error);

        return sendServiceWorkerMessage({ isOnline: false });

    });
};

async function cacheOnly(event){

    return caches.match(event.request).then( cacheResponse => {

        return cacheResponse || 
        
        caches.match('/fallingsand/404.html')
        
        .then( response => response )
        
        .catch( error => console.warn(`Failed to retrieve 404: ${error}`));

    });

};

async function cacheFirst(event){

    return caches.match(event.request).then( cacheResponse => {

        return cacheResponse || fetch(event.request);

    });

};

function networkOnly(event){

    return fetch(event.request);

};

async function networkFirst(event){

    return fetch(event.request).then( fetchResponse => {

        if(fetchResponse.ok) return fetchResponse;

        return caches.match(event.request);
    });
};

async function staleWhileRevalidate(event, cacheName){

    return caches.match(event.request).then( cacheResponse => {

        return cacheResponse || fetch(event.request).then( async response => {

            if(!response || response.status === 404 || response.status !== 200){

                return caches.match('/fallingsand/404.html').then( response => response );
            }

            return caches.open(cacheName).then( cache => {

                cache.put(event.request, response.clone());

                return response;
            })
            
        });
    });

};

async function networkRevalidateAndCache(event, cacheName){

    return fetch(event.request).then( async fetchResponse => {

        if(fetchResponse.ok){

            return caches.open(cacheName).then( cache => {

                cache.put(event.request, fetchResponse.clone());

                return fetchResponse;
            });

        }else{

            return caches.match(event.request);

        }
    });
};

