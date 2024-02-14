const version = 13;
const staticCacheName = `staticCache-${version}`;
const imageCacheName = `imageCache-${version}`;
const dynamicCacheName = `dynamicCache`;

const assets = [
    './',
    './index.html',
    './main.css',
    './js/app.js',
    './js/falling_sand.js',
    './js/notification.js',
    './js/utilities.js',
    './manifest.json',
    './img/apple-touch-icon.png',
    './img/android-chrome-192x192.png',
    './img/android-chrome-512x512.png',
    './img/favicon-16x16.png',
    './img/favicon-32x32.png',
    './img/screenshot_fallingsand_323x703.png',
    './img/screenshot_fallingsand_718x332.png',
    './img/claydoublewave_edit_500x667.png'
];


self.addEventListener('install', (event)=> {

    //installed

    console.log(`Version ${version} installed.`);

    event.waitUntil(

        caches.open(staticCacheName).then( (cache) => {

            cache.addAll(assets).then( 

                ()=> {

                    console.log(`${staticCacheName} has been updated.`);

                }, (error)=> {

                    console.warn(`failed to updated ${staticCacheName}`,error);

                }
            )
        })

    );  

});

self.addEventListener('activate', (event)=>{

    console.log('activated');

    event.waitUntil(

        caches.keys().then( (keys) => {

            return Promise.all(

                keys.filter( (key) => {

                    if(key != staticCacheName){

                        return true;
                    }
                })
                .map( (key) => caches.delete(key))

            );

        })
    );

});

self.addEventListener('message', (event)=>{

    const data = event.data;

    console.log('SW received', data);

    if('checkOnline' in data){

        const testUrl = `/test_online.txt`;
        
        const request = new Request(testUrl, {

            method: 'HEAD'
        });

        event.waitUntil(

            fetch(request).then( (response)=> {

                console.log('Able to get the test data headers');

                return sendServiceWorkerMessage({ isOnline: true });

            }, (error)=> {

                console.log('Failed to fetch test data headers',error);

                return sendServiceWorkerMessage({ isOnline: false });

            })
        );
    }
    
});

self.addEventListener('fetch', (event) => {

    console.log(`fetch request for: ${event.request.url} --- MODE: ${event.request.mode}`);
    

    // UGH I don't know how I should hanle this!!!! Fucking hell!!!!!


    const isOnline = self.navigator.onLine;

    const url = new URL(event.request.url);

    const isImage = url.pathname.match(/\.(png|jpeg|jpg|gif)$/i);

    const isJSON = url.pathname.endsWith('.json');

    const isCSS = url.pathname.endsWith('.css');

    const isHTML = event.request.mode === 'navigate';

    const isJavaScript = url.pathname.endsWith('.js');

    const selfUrl = new URL(self.location);

    const isExternal = event.request.mode === 'cors' || selfUrl.hostname !== url.hostname;

    if(isOnline){

        event.respondWith( staleWhileRevalidate(event, staticCacheName) );

    }else{

        event.respondWith( cacheOnly(event) );

    }

    // event.respondWith(

    //     caches.match(event.request).then( (cacheResponse)=>{

    //         return cacheResponse || fetch(event.request)

    //         .then( async (fetchResponse)=> {

    //             if(!fetchResponse || !fetchResponse.ok){

    //                 return fetchResponse;
    //             }

    //             const type = fetchResponse.headers.get('content-type');

    //             if(type && type.includes('text/html')){

    //                 console.log(`saved file ${event.request.url}`);

    //                 return caches.open(staticCacheName).then( cache => {

    //                     cache.put(event.request, fetchResponse.clone());

    //                     return fetchResponse;
    //                 })

    //             }else if(type && type.startsWith('image')){

    //                 console.log(`saved aan IMAGE file ${event.request.url}`);

    //                 return caches.open(imageCacheName).then( (cache)=> {

    //                     cache.put(event.request, fetchResponse.clone());

    //                     return fetchResponse;
    //                 })

    //             }else{

    //                 return caches.open(dynamicCacheName).then( (cache)=> {

    //                     cache.put(event.request, fetchResponse.clone());

    //                     return fetchResponse;
    //                 })
    //             }
    //         })
    //     })
    // )

});

function cacheOnly(event){

    return caches.match(event.request);

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

                return caches.match('404.html');
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

async function sendServiceWorkerMessage(message){

    const allClients = await clients.matchAll({ includeUncontrolled: true });

    return Promise.all(

        allClients.map( (client)=> {

            if('inOnline' in message){
    
                console.log('tell the browser if online');
            }
            
            return client.postMessage(message);

        })
    );
};