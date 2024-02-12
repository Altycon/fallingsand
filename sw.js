const version = 18;
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
    './manifest.json'
];

const imageAssets = [
    './img/android-chrome-192x192.png',
    './img/android-chrome-512x512.png',
    './img/apple-touch-icon.png',
    './img/favicon-16x16.png',
    './img/favicon-32x32.png',
    './img/screenshot_fallingsand_323x703.png',
    './img/screenshot_fallingsand_718x332.png',
    './img/claydoublewave_edit_500x667.png'
]

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
        }).then(
            caches.open(imageCacheName).then( (cache)=> {

                cache.addAll(imageAssets).then(

                    ()=> {
    
                        console.log(`${imageCacheName} has been updated.`);
    
                    }, (error) =>{
    
                        console.warn(`failed to updated ${imageCacheName}`,error);
                    }
                )
            }) 
        )

    );  

});

self.addEventListener('activate', (event)=>{

    console.log('activated');

    event.waitUntil(

        caches.keys().then( (keys) => {

            return Promise.all(

                keys.filter( (key) => {

                    if(key != staticCacheName && key != imageCacheName){

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

    console.log(`fetch request for: ${event.request.url}`);

    event.respondWith(

        caches.match(event.request).then( (cacheResonse)=>{

            return cacheResonse || fetch(event.request)

            .then( async (fetchResponse)=> {

                const type = fetchResponse.headers.get('content-type');

                if(type && type.match(/^text\/css\/html\/js\/json/i)){

                    console.log(`saved a CSS file ${event.request.url}`);

                    return caches.open(staticCacheName).then( cache => {

                        cache.put(event.request, fetchResponse.clone());

                        return fetchResponse;
                    })

                }else if(type && type.match(/^image\//i)){

                    console.log(`saved aan IMAGE file ${event.request.url}`);

                    return caches.open(imageCacheName).then( (cache)=> {

                        cache.put(event.request, fetchResponse.clone());

                        return fetchResponse;
                    })

                }else{

                    return caches.open(dynamicCacheName).then( (cache)=> {

                        cache.put(event.request, fetchResponse.clone());

                        return fetchResponse;
                    })
                }
            })
        })
    )

});

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