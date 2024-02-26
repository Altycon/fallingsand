export const Sand = {
    
    canvas: undefined,
    resolution: undefined,
    context: undefined,
    canvasWidth: undefined,
    canvasHeight: undefined,
    columns: undefined,
    rows: undefined,
    gridLength: undefined,
    grid: undefined,
    nextGeneration: undefined,
    hue: 1,
    spread: 10,

init(sandCanvas,initialResolution){
    Sand.canvas = sandCanvas,
    Sand.resolution = initialResolution || 10,
    Sand.context = Sand.canvas.getContext('2d');
    Sand.canvasWidth = Sand.canvas.width;
    Sand.canvasHeight = Sand.canvas.height;
    Sand.columns = Math.floor(Sand.canvasWidth/Sand.resolution);
    Sand.rows = Math.floor(Sand.canvasHeight/Sand.resolution);
    Sand.gridLength = Sand.columns*Sand.rows;
    Sand.grid = new Array(Sand.gridLength);
    Sand.nextGeneration = new Array(Sand.gridLength);
    
},
loopGrid(callback){
    for(let i = 0; i < Sand.gridLength; i++){
        callback(i);
    }
},
buildGrid(){
    Sand.loopGrid((i)=>{
        Sand.grid[i] = { state: 0, hue: 0, gravity: 0 };
        Sand.nextGeneration[i] = { state: 0, hue: 0, gravity: 0 };
    });
},
buildRandomGrid(){
    Sand.loopGrid((i)=>{
        Sand.grid[i] = Math.random() > 0.5 ? 1:0;
    });
},
addSand(positionX,positionY){
   
    const row = Math.floor( positionY / Sand.resolution);
    const column = Math.floor( positionX / Sand.resolution);

    if(!row || !column) return;

    for(let i = -Sand.spread; i <= Sand.spread; i++){
        for(let j = -Sand.spread; j < Sand.spread; j++){

            if(i === 0 || j === 0) continue;

            const r = (row + j + Sand.rows) % Sand.rows;
            const c = (column + (i + 1) + Sand.columns) % Sand.columns;
            const index = r * Sand.columns + c;

            const cell = Sand.grid[index];

            if(cell.state === 0){
                
                if(Math.random() < 0.15){

                    cell.hue = Sand.hue;

                    cell.state = 1;

                    cell.gravity = Math.floor(Math.random()*4) + 1;

                }

            }
            
        }
    }
},
update(){
    Sand.loopGrid((i)=>{
        Sand.nextGeneration[i].state = Sand.grid[i].state;
        Sand.nextGeneration[i].hue = Sand.grid[i].hue;
        Sand.nextGeneration[i].gravity = Sand.grid[i].gravity;
    });

    Sand.loopGrid((i)=>{
        const cell = Sand.grid[i];

        const row = Math.floor(i / Sand.columns);
        const column = i % Sand.columns;

        if(cell.state > 0){

            const downIndex = (row + cell.gravity) * Sand.columns + column;

            const downCell = Sand.grid[downIndex];

            let direction = 1;

            if(Math.random() < 0.5) direction *= -1;

            const leftIndex = (row + 1) * Sand.columns + (column - direction);

            const rightIndex = (row + 1) * Sand.columns + (column + direction);

            const leftCell = Sand.grid[leftIndex];

            const rightCell = Sand.grid[rightIndex];

            if(downCell && downCell.state === 0){

                Sand.nextGeneration[i].state = 0;

                Sand.nextGeneration[downIndex].state = 1;

                Sand.nextGeneration[downIndex].hue = cell.hue;

                Sand.nextGeneration[downIndex].gravity = cell.gravity;

            }else if(leftCell && leftCell.state === 0){

                Sand.nextGeneration[i].state = 0;

                Sand.nextGeneration[leftIndex].state = 1;

                Sand.nextGeneration[leftIndex].hue = cell.hue;

                Sand.nextGeneration[leftIndex].gravity = cell.gravity;

            }else if(rightCell && rightCell.state === 0){

                Sand.nextGeneration[i].state = 0;

                Sand.nextGeneration[rightIndex].state = 1;

                Sand.nextGeneration[rightIndex].hue = cell.hue;

                Sand.nextGeneration[rightIndex].gravity = cell.gravity;

            }else{

                Sand.nextGeneration[i].state = cell.state;

                Sand.nextGeneration[i].hue = cell.hue;

                Sand.nextGeneration[i].gravity = cell.gravity;

            }
        }
    });
    Sand.loopGrid((i)=>{
        Sand.grid[i].state = Sand.nextGeneration[i].state;
        Sand.grid[i].hue = Sand.nextGeneration[i].hue;
        Sand.grid[i].gravity = Sand.nextGeneration[i].gravity;
    });
},
renderGrid(){
    Sand.context.clearRect(0,0,Sand.canvasWidth,Sand.canvasHeight);
    Sand.loopGrid((i)=>{
        const row = Math.floor(i / Sand.columns);
        const col = i % Sand.columns;
        const cell = Sand.grid[i];

        if(cell.state === 1){
            
            Sand.context.fillStyle = `hsl(${cell.hue} 100% 50%)`;
            Sand.context.fillRect(
                col * Sand.resolution, 
                row * Sand.resolution, 
                Sand.resolution, 
                Sand.resolution
            );
        }
    });
    
},
animate(){

    let lasttime = performance.now();

    function loop(timestamp){

        const delta = timestamp - lasttime;

        if(delta){

            Sand.context.clearRect(0,0,Sand.canvasWidth,Sand.canvasHeight);

            Sand.update();

            Sand.renderGrid();

            lasttime = timestamp;

        }

        requestAnimationFrame(loop);
    }
    loop();
},
clearDisplay(){

    Sand.context.clearRect(0,0,Sand.canvasWidth,Sand.canvasHeight);

},
resetGrid(){

    Sand.buildGrid();
}
};