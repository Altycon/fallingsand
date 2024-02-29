
import { Sand } from "./sand.js";

function isMobileDevice(DEVICE) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(DEVICE) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(DEVICE.substr(0, 4))){
        return true;
    }else{
        return false;
    }
};

const APP = {

    isOnline: true,
    isMobile: false,
    serviceWorker: undefined,
    indexedDatabse: undefined,
    fallingSandCanvas: undefined,
    fallingSandContext: undefined,
    canvasTop: undefined,
    canvasLeft: undefined,
    DPI: devicePixelRatio,
    autoColor: true,
    sandHue: undefined,

    notify(message){

        document.querySelector('.notification-message').textContent = message;
        
    },
    hasServiceWorker(){

        return ('serviceWorker' in navigator);

    },
    goneOnline(){

        APP.isOnline = true;

        APP.notify('ONLINE');

    },
    goneOffline(){

        APP.isOnline = false;

        APP.notify('OFFLINE');
    },

    registerServiceWorker(){

        navigator.serviceWorker.register('/fallingsand/sw.js', { scope: '/fallingsand/' })
        .then( (registration) => {

            APP.serviceWorker = registration.installing || registration.waiting || registration.active;

            //console.log('service worker registered');

        })
        .catch( (error)=> {

            console.log(`Failed to register`, error.message);

        });

        // see if page currently has service worker
        if(navigator.serviceWorker.controller){

            //console.log('Serive worker is installed');

            navigator.serviceWorker.controller.postMessage({
                
                checkOnline: APP.isOnline

            });
        };

        navigator.serviceWorker.oncontrollerchange = (event)=>{

            //console.log('New service worker activated', event);
        };

        navigator.serviceWorker.addEventListener('message', ({ data })=>{

            if('isOnline' in data){

                APP.isOnline = data.isOnline;

                APP.notify(APP.isOnline ? 'CONFIRMED: ONLINE':'CONFIRMED: OFFLINE');

            }
        });

    },

    unRegisterAllRegisteredServiceWorkers(){

        //something that you can do but won't need to unless special need
        navigator.serviceWorker.getRegistrations().then( registrations => {
    
            for(let registration of registrations){
    
                registration.unregister().then( isUnregistered => console.log( isUnregistered ));
    
            }
        });
    
    },

    fixCanvas(canvas,dpi){

        const main = document.querySelector('main');
    
        const styleWidth = +getComputedStyle(main).getPropertyValue('width').slice(0,-2);
        
        const styleHeight = +getComputedStyle(main).getPropertyValue('height').slice(0,-2);
    
        canvas.setAttribute('width', styleWidth * dpi);
    
        canvas.setAttribute('height', styleHeight * dpi);
    
        return canvas;
    
    },
    setActiveColorDisplay(hue){

        document.querySelector('.falling-sand-active-color-display').style.backgroundColor = `hsl(${hue} 100% 50%)`;

    },
    handleAddingSandOnMove(event){

        event.preventDefault();

        const { clientX, clientY } = APP.isMobile ? event.touches[0]:event;

        if(APP.worker){
    
            APP.worker.postMessage({

                action: 'add',
                positionX: Math.floor(clientX - APP.canvasLeft) * APP.DPI,
                positionY: Math.floor(clientY - APP.canvasTop) * APP.DPI,
                hueIncrease: APP.autoColor          
            });

        }else{

            if(APP.autoColor){

                Sand.hue += 0.5;

                APP.setActiveColorDisplay(Sand.hue);

            }else{

                if(Sand.hueCenter === undefined) Sand.hueCenter = Sand.hue;
    
                Sand.hue = Sand.hueCenter + Sand.rangeValues[Math.floor(Math.random()*Sand.rangeValues.length)];
            }

            Sand.addSand(

                Math.floor(clientX - APP.canvasLeft) * APP.DPI, 
                Math.floor(clientY - APP.canvasTop) * APP.DPI
            );
        }

    },
    handleAutoColorSwitch(event){

        if(event.target.value === "false"){
    
            APP.autoColor = true;

            event.target.value = "true";

            event.target.style.backgroundColor = 'cornflowerblue';

            event.target.style.color = 'black';

            if(APP.worker){

                APP.worker.postMessage({ action: 'change_hue', removeCenter: true })

            }else{

                APP.sandHue = undefined;

            }

        }else if(event.target.value === "true"){

            APP.autoColor = false;

            event.target.value = "false";

            event.target.style.backgroundColor = 'black';

            event.target.style.color = 'white';

            if(APP.worker){

                const colorInput = document.querySelector('#FallingSandColorInput')

                APP.worker.postMessage({ action: 'change_hue', hue: Number(colorInput.value)})

            }
        }
    },
    handleColorInput(event){

        const button = document.querySelector('#FallingSandAutoColorButton');
    
            if(button.value === "true"){

                button.style.backgroundColor = 'black';

                button.style.color = 'white';

                button.value = "false";
            }
    
            APP.autoColor = false;
    
            if(APP.worker){

                APP.setActiveColorDisplay(event.target.value);

                APP.worker.postMessage({ action: 'change_hue', hue: Number(event.target.value)})

            }else{

                Sand.hue = Number(event.target.value);

                APP.setActiveColorDisplay(Sand.hue);

                APP.sandHue = undefined;

            }           

    },
    
    clearFallingSandCanvas(){

        if(confirm('Are you sure you want to reset the image?')){

            if(APP.worker){

                APP.worker.postMessage({ action: 'reset'})

            }else{

                Sand.clearDisplay();
    
                Sand.resetGrid();

            }
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

    initializeFallingSandCanvas(){

        APP.fallingSandCanvas = APP.fixCanvas(document.querySelector(`#FallingSandCanvas`),APP.DPI);

        const rect = APP.fallingSandCanvas.getBoundingClientRect();

        APP.canvasTop = rect.top;
        APP.canvasLeft = rect.left;

    },
    messageFromWorker(event){

        const { data } = event;

        switch(data.type){

            case 'message':

            console.log(data.message);

            break;

            case 'error':

            console.log('WEBWORKER_MESSAGE_ERROR', data.message);

            break;

            default:

            console.log(`No know "type" property in data.`);

            break;
        }
    },
    workerError(error){
        
        console.log('WEBWORKER_ERROR', error);

    },
    useWorker(){

        APP.worker = new Worker('/fallingsand/worker.js', { type: 'module' });

            const offScreenCanvas = APP.fallingSandCanvas.transferControlToOffscreen();

            APP.worker.addEventListener('message', (event)=>{
                const { data } = event;
                
                switch(data.action){

                    case 'change_hue':

                        APP.setActiveColorDisplay(data.hue);

                    break;

                    case 'start':

                        APP.worker.postMessage({ action:'animate'});

                    break;

                }
            });

            APP.worker.addEventListener('error', APP.workerError);

            APP.worker.postMessage({ action:'initialize', canvas: offScreenCanvas, screenWidth: innerWidth }, [offScreenCanvas]);

    },
    init(){

        window.addEventListener('online', APP.goneOnline);

        window.addEventListener('offline', APP.goneOffline);


        if(APP.hasServiceWorker()){

            APP.registerServiceWorker()
                        
        }

        APP.isMobile = isMobileDevice(navigator.userAgent || navigator.vendor || window.opera);

        APP.initializeFallingSandCanvas();

        APP.setActiveColorDisplay(1);

        if('Worker' in window && 'Blob' in window){

            APP.useWorker();

        }else{

            Sand.init(APP.fallingSandCanvas, innerWidth < 500 ? 4:2);

            Sand.buildGrid();

            Sand.animate();

        }

        APP.listen();



        APP.controlMyImage();

    },
};
document.addEventListener('DOMContentLoaded', APP.init);

