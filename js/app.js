import { FallingSand } from "./falling_sand.js";
import { fixCanvas, isMobileDevice } from "./utilities.js";

const APP = {

    isMobile: false,
    fallingSandCanvas: undefined,
    fallingSandContext: undefined,
    fallingSandCanvasWidth: 0,
    fallingSandCanvasHeight: 0,
    DPI: devicePixelRatio,

    handleAddingSandOnMove: function(event){

        event.preventDefault();

        const { target, clientX, clientY } = APP.isMobile ? event.touches[0]:event;

        const rect = target.getBoundingClientRect();

        FallingSand.addSand((clientX - rect.left),(clientY - rect.top));

    },
    handleAutoColorSwitch: function(event){

        if(event.target.value === "false"){
    
            FallingSand.autoColor = true;

            event.target.value = "true";

            event.target.style.backgroundColor = 'cornflowerblue';

        }else if(event.target.value === "true"){

            FallingSand.autoColor = false;

            event.target.value = "false";

            event.target.style.backgroundColor = 'black';
        }
    },
    handleColorInput(event){

        const button = document.querySelector('#FallingSandAutoColorButton');
    
            if(button.value === "true"){

                button.style.backgroundColor = 'black';

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
    listen(){

        APP.fallingSandCanvas.addEventListener(APP.isMobile ? 'touchmove':'pointermove', APP.handleAddingSandOnMove);

        document.querySelector('#FallingSandAutoColorButton').addEventListener('click', APP.handleAutoColorSwitch);

        document.querySelector('#FallingSandCanvasResetButton').addEventListener('click', APP.clearFallingSandCanvas);

        document.querySelector('#FallingSandColorInput').addEventListener('input', APP.handleColorInput);
    },

    init: function(){

        APP.isMobile = isMobileDevice(navigator.userAgent || navigator.vendor || window.opera);

        APP.fallingSandCanvas = fixCanvas(document.querySelector(`#FallingSandCanvas`),APP.DPI);

        console.log(APP.fallingSandCanvas)

        APP.fallingSandContext = APP.fallingSandCanvas.getContext('2d');

        APP.fallingSandCanvasWidth = APP.fallingSandCanvas.width;

        APP.fallingSandCanvasHeight = APP.fallingSandCanvas.height;

        FallingSand.initialize(APP.fallingSandCanvasWidth,APP.fallingSandCanvasHeight,0,document.querySelector('.falling-sand-active-color-display'));

        APP.listen();

        FallingSand.animate(APP.fallingSandContext);

    },
};
APP.init();

