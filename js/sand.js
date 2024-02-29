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
    circleSize: undefined,
    hue: 1,
    spread: 10,
    direction: 1,
    TWO_PI: Math.PI*2,

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
    Sand.circleSize = Sand.resolution*0.8;
    
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

    for(let i = -Sand.spread; i <= Sand.spread; i+=2){
        for(let j = -Sand.spread; j < Sand.spread; j++){

            if(i === 0 || j === 0) continue;

            const r = (row + j + Sand.rows) % Sand.rows;
            const c = (column + (i + 1) + Sand.columns) % Sand.columns;
            const index = r * Sand.columns + c;

            const cell = Sand.grid[index];

            if(cell.state === 0 && Math.random() < 0.15){ 

                cell.hue = Sand.hue;

                cell.state = 1;

                cell.gravity = Math.floor(Math.random()*4) + 1;

            }
            
        }
    }
},
updateNextGenerationCell(index,state,hue,gravity){
    Sand.nextGeneration[index].state = state;
    Sand.nextGeneration[index].hue = hue;
    Sand.nextGeneration[index].gravity = gravity;
},
update(){
    Sand.loopGrid((i)=>{
       
        Sand.updateNextGenerationCell(i,Sand.grid[i].state,Sand.grid[i].hue,Sand.grid[i].gravity);

    });

    Sand.loopGrid((i)=>{
        const cell = Sand.grid[i];

        const row = Math.floor(i / Sand.columns);
        const column = i % Sand.columns;

        if(cell.state > 0){

            const downIndex = (row + cell.gravity) * Sand.columns + column;

            const downCell = Sand.grid[downIndex];

            if(Math.random() < 0.5) Sand.direction *= -1;

            const leftIndex = (row + 1) * Sand.columns + (column - Sand.direction);

            const rightIndex = (row + 1) * Sand.columns + (column + Sand.direction);

            const leftCell = Sand.grid[leftIndex];

            const rightCell = Sand.grid[rightIndex];

            if(downCell && downCell.state === 0){

                Sand.nextGeneration[i].state = 0;

                Sand.updateNextGenerationCell(downIndex,1,cell.hue,cell.gravity);

            }else if(leftCell && leftCell.state === 0){

                Sand.nextGeneration[i].state = 0;

                Sand.updateNextGenerationCell(leftIndex,1,cell.hue,cell.gravity);

            }else if(rightCell && rightCell.state === 0){

                Sand.nextGeneration[i].state = 0;

                Sand.updateNextGenerationCell(rightIndex,1,cell.hue,cell.gravity);

            }else{

                Sand.updateNextGenerationCell(i,cell.state,cell.hue,cell.gravity);

            }
        }
    });
    Sand.loopGrid((i)=>{
        Sand.grid[i].state = Sand.nextGeneration[i].state;
        Sand.grid[i].hue = Sand.nextGeneration[i].hue;
        Sand.grid[i].gravity = Sand.nextGeneration[i].gravity;
    });
},
becomeSquare(col,row){
    
    Sand.context.fillRect(
        col * Sand.resolution, 
        row * Sand.resolution, 
        Sand.resolution, 
        Sand.resolution
    );
},
becomeCircle(col,row){
    Sand.context.beginPath();
    Sand.context.arc(
        (col * Sand.resolution) - (Sand.resolution*0.5), 
        (row * Sand.resolution) - (Sand.resolution*0.5), 
        Sand.circleSize, 
        0,
        Sand.TWO_PI
    );
    Sand.context.fill();
},
renderGrid(){
    Sand.context.clearRect(0,0,Sand.canvasWidth,Sand.canvasHeight);
    Sand.loopGrid((i)=>{
        const row = Math.floor(i / Sand.columns);
        const col = i % Sand.columns;
        const cell = Sand.grid[i];

        if(cell.state === 1){

            Sand.context.fillStyle = `hsl(${cell.hue} 100% 50%)`;

            Sand.becomeSquare(col,row);

        }
    });
    
},
animate(){

    let lasttime = performance.now();

    function loop(timestamp){

        const delta = timestamp - lasttime;

        if(delta && lasttime !== timestamp){ // <== ?? lasttime !== timestamp?

            Sand.context.clearRect(0,0,Sand.canvasWidth,Sand.canvasHeight);

            Sand.update();

            Sand.renderGrid();

            lasttime = timestamp;

        }

        requestAnimationFrame(loop);
    }
    loop(); //requestAnimationFrame(loop);?
},
clearDisplay(){

    Sand.context.clearRect(0,0,Sand.canvasWidth,Sand.canvasHeight);

},
resetGrid(){

    Sand.buildGrid();
}
};