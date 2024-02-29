
import { Sand } from "./js/sand.js";

self.addEventListener('message', (event)=>{

    const data = event.data;

    if('action' in data){

        switch(data.action){

            case 'add':

                const { positionX, positionY, hueIncrease } = data;

                if(hueIncrease){

                    Sand.hue += 0.5;

                }else{

                    if(Sand.hueCenter === undefined) Sand.hueCenter = Sand.hue;
    
                    Sand.hue = Sand.hueCenter + Sand.rangeValues[Math.floor(Math.random()*Sand.rangeValues.length)];
                }

                self.postMessage({ action: 'change_hue', hue: Sand.hue });

                Sand.addSand(positionX, positionY)

            break;

            case 'change_hue':

                if('removeCenter' in data ){

                    Sand.hueCenter = undefined;

                }else{

                    Sand.hue = data.hue;

                    Sand.hueCenter = Sand.hue;

                }

                self.postMessage({ action: 'change_hue', hue: Sand.hue });

            break;

            case 'reset':

                Sand.clearDisplay();
        
                Sand.resetGrid();

            break;

            case 'animate':

                Sand.animate();

            break;

            case 'initialize':

                Sand.init(data.canvas, data.screenWidth < 500 ? 4:2);

                Sand.buildGrid();

                self.postMessage({ action: 'start' })

            break;
        }
    }
    
    
});