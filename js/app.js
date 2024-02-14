
import { FallingSand } from "./falling_sand.js";
import { notify } from "./notification.js";
import { fixCanvas, hasServiceWorker, isMobileDevice } from "./utilities.js";

const version = 2;

const APP = {

    isOnline: true,
    isMobile: false,
    serviceWorker: undefined,
    indexedDatabse: undefined,
    cacheName: `staticCache-${version}`,
    fallingSandCanvas: undefined,
    fallingSandContext: undefined,
    fallingSandCanvasWidth: 0,
    fallingSandCanvasHeight: 0,
    DPI: devicePixelRatio,

    probably: function(){


        return APP.isOnline ? "Probably Online": "Probably Offline";

    },

    goneOnline: function(event){

        APP.isOnline = true;

        notify('ONLINE');

    },
    goneOffline: function(event){

        APP.isOnline = false;

        notify('OFFLINE');
    },

    // startCaching: function(){

    //     caches.open(APP.cacheName).then( cache => {

    //         console.log('Cache', cache)
    //     });

    // },

    handleAddingSandOnMove: function(event){

        event.preventDefault();

        const { target, clientX, clientY } = APP.isMobile ? event.touches[0]:event;

        const rect = target.getBoundingClientRect();

        FallingSand.addSand( Math.floor(clientX - rect.left) * APP.DPI, Math.floor(clientY - rect.top) * APP.DPI);

    },
    handleAutoColorSwitch: function(event){

        if(event.target.value === "false"){
    
            FallingSand.autoColor = true;

            event.target.value = "true";

            event.target.style.backgroundColor = 'cornflowerblue';

            event.target.style.color = 'black';

        }else if(event.target.value === "true"){

            FallingSand.autoColor = false;

            event.target.value = "false";

            event.target.style.backgroundColor = 'black';

            event.target.style.color = 'white';
        }
    },
    handleColorInput(event){

        const button = document.querySelector('#FallingSandAutoColorButton');
    
            if(button.value === "true"){

                button.style.backgroundColor = 'black';

                button.style.color = 'white';

                button.value = "false";
            }
    
            FallingSand.autoColor = false;
    
            FallingSand.hue = Number(event.target.value);
    
            FallingSand.setActiveColorDisplay(FallingSand.hue);

    },
    
    clearFallingSandCanvas(){

        if(confirm('Are you sure you want to reset the image?')){

            APP.fallingSandContext.clearRect(
                0,
                0,
                APP.fallingSandCanvas.width,
                APP.fallingSandCanvas.height
            );
    
            FallingSand.reset();
        }
    },

    controlMyImage(){

        const myimage = document.querySelector('.myimage_wrapper');

        function handleResetMyImage({target}){
            target.style.opacity = 0;
            target.style.top = "";
            target.style.bottom = ""
            target.style.right = "";
            target.style.left = "";
            target.style.rotate = ``;
            target.translate = ``;
            target.style.animation = ``;
        };

        setInterval( ()=> {

            const randomState = Math.floor(Math.random()*5);

            switch(randomState){

                case 0:

                myimage.style.opacity = 1;
                myimage.style.top = `${Math.floor(Math.random()*innerWidth)}px`;
                myimage.style.right = 0;
                myimage.style.rotate = `270deg`;
                myimage.translate = `200px 0px`;
                myimage.addEventListener('animationend', handleResetMyImage);
                myimage.style.animation = `slideImageRight 1s linear forwards`;

                break;

                case 1:

                myimage.style.opacity = 1;
                myimage.style.top = 0;
                myimage.style.left = `${Math.floor(Math.random()*(innerWidth - 200))}px`;
                myimage.style.rotate = `180deg`;
                myimage.translate = `0px -300px`;
                myimage.addEventListener('animationend', handleResetMyImage);
                myimage.style.animation = `slideImageDown 1s linear forwards`;

                break;

                case 2:

                myimage.style.opacity = 1;
                myimage.style.bottom = 0;
                myimage.style.left = `${Math.floor(Math.random()*(innerWidth - 200))}px`;
                myimage.translate = `0px 300px`;
                myimage.addEventListener('animationend', handleResetMyImage);
                myimage.style.animation = `slideImageUp 1s linear forwards`;

                break;

                case 3:

                myimage.style.opacity = 1;
                myimage.style.top = `${Math.floor(Math.random()*innerWidth)}px`;
                myimage.style.left = 0;
                myimage.style.rotate = `90deg`;
                myimage.translate = `-200px 0px`;
                myimage.addEventListener('animationend', handleResetMyImage);
                myimage.style.animation = `slideImageLeft 1s linear forwards`;

                break;
                
                case 4:

                myimage.style.opacity = 1;
                myimage.style.top = `${Math.floor(Math.random()*innerWidth)}px`;
                myimage.style.right = 0;
                myimage.style.rotate = `300deg`;
                myimage.translate = `200px 0px`;
                myimage.addEventListener('animationend', handleResetMyImage);
                myimage.style.animation = `slideImageRight 1s linear forwards`;

                break;
                default:

                myimage.style.opacity = 1;
                myimage.style.bottom = 0;
                myimage.style.left = `${Math.floor(Math.random()*(innerWidth - 200))}px`;
                myimage.translate = `0px 300px`;
                myimage.addEventListener('animationend', handleResetMyImage);
                myimage.style.animation = `slideImageUp 1s linear forwards`;

                break;
            }
        }, Math.floor(10 + (Math.random() * 60)) * 1000);


    },


    listen(){

        APP.fallingSandCanvas.addEventListener(APP.isMobile ? 'touchmove':'pointermove', APP.handleAddingSandOnMove);

        document.querySelector('#FallingSandAutoColorButton').addEventListener('click', APP.handleAutoColorSwitch);

        document.querySelector('#FallingSandCanvasResetButton').addEventListener('click', APP.clearFallingSandCanvas);

        document.querySelector('#FallingSandColorInput').addEventListener('input', APP.handleColorInput);
    },

    init(){

        notify(APP.probably())

        window.addEventListener('online', APP.goneOnline);

        window.addEventListener('offline', APP.goneOffline);


        if(hasServiceWorker()){

            console.log('service worker found')

            navigator.serviceWorker.register('/fallingsand/sw.js', {

                    //updateViaCache: 'none',
                    scope: '/fallingsand/'

                })
                .then( (registration) => {

                    APP.serviceWorker = registration.installing || registration.waiting || registration.active;

                    console.log('service worker registered');

                })
                .catch( (error)=> {

                    console.log(`Failed to register`, error.message);

                });

                // see if page currently has service worker
                if(navigator.serviceWorker.controller){

                    console.log('Serive worker is installed');

                    navigator.serviceWorker.controller.postMessage({
                        
                        checkOnline: APP.isOnline

                    });
                };

                navigator.serviceWorker.oncontrollerchange = (event)=>{

                    console.log('New service worker activated', event);
                };

                navigator.serviceWorker.addEventListener('message', ({ data })=>{

                    //recieved a message fro mthe service worker
                    console.log(data, 'from service worker');

                    // do something with the response from the service worker
                    if('isOnline' in data){

                        APP.isOnline = data.isOnline;

                        notify(APP.isOnline ? 'CONFIRMED: ONLINE':'CONFIRMED: OFFLINE');

                        if(APP.isOnline){

                            console.log('Maybe I should do something here.');
                        }
                    }
                });

                
        }else{

            console.log('Serive worker not supported');

            alert('Serive worker not supported in your browser');
        }


        APP.isMobile = isMobileDevice(navigator.userAgent || navigator.vendor || window.opera);

        APP.fallingSandCanvas = fixCanvas(document.querySelector(`#FallingSandCanvas`),APP.DPI);

        APP.fallingSandContext = APP.fallingSandCanvas.getContext('2d');

        APP.fallingSandCanvasWidth = APP.fallingSandCanvas.width;

        APP.fallingSandCanvasHeight = APP.fallingSandCanvas.height;

        FallingSand.initialize(APP.fallingSandCanvasWidth,APP.fallingSandCanvasHeight,0,document.querySelector('.falling-sand-active-color-display'));

        APP.listen();

        FallingSand.animate(APP.fallingSandContext);

        APP.controlMyImage();

    },
};
//APP.init();
document.addEventListener('DOMContentLoaded', APP.init);

