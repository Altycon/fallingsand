
import { Sand } from "./js/sand.js";

self.addEventListener('message', (event)=>{

    const data = event.data;

    if('action' in data){

        switch(data.action){

            case 'add':

                const { positionX, positionY, hueIncrease } = data;

                if(hueIncrease) Sand.hue += 0.5;

                Sand.addSand(positionX, positionY)

            break;

            case 'change_hue':

                Sand.hue = data.hue;

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