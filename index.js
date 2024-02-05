


const mousePostion = {x: undefined, y: undefined };

let grid;

let hue = 0;

function fixCanvas(canvas,dpi){

    const styleWidth = +getComputedStyle(canvas).getPropertyValue('width').slice(0,-2);
    
    const styleHeight = +getComputedStyle(canvas).getPropertyValue('height').slice(0,-2);

    canvas.setAttribute('width', styleWidth * dpi);

    canvas.setAttribute('height', styleHeight * dpi);

};

function make2dArray(columns,rows){

    const arr = new Array(columns);

    for(let i = 0; i < arr.length; i++){

        arr[i] = new Array(rows).fill(0);
    }

    return arr;
};

function drawGrid(context,resolution,grid){

    

    for(let i = 0; i < grid.length; i++){

        for(let j = 0; j < grid[i].length; j++){

            const cell = grid[i][j];

            if(cell > 0){

                context.fillStyle = `hsl(${cell} 100% 50%)`;

                context.fillRect(i * resolution, j * resolution, resolution, resolution);
            }

        }
    }

};

function updateGrid(grid){

    const newGrid = grid.map( cell => cell.map( val => 0));

    const columns = newGrid.length;

    const rows = newGrid[0].length;

    for(let i = 0; i < columns; i++){

        for(let j = 0; j < rows; j++){

            const state = grid[i][j];

            if(state > 0){

                const below = grid[i][j + 1];


                let dir = 1;

                if(Math.random() < 0.5) dir *= -1;
                
                let left,right;

                if(i > 0 && i < columns - 1){

                    left = grid[i - dir][j + 1];

                    right = grid[i + dir][j + 1];

                }


                if(below === 0){

                    newGrid[i][j] = 0;

                    newGrid[i][j + 1] = state;

                }else if(left === 0){

                    newGrid[i - dir][j + 1] = state;

                }else if(right === 0){

                    newGrid[i + dir][j + 1] = state;

                }else{

                    newGrid[i][j] = state;
                }
            }

        }
    }

    return newGrid;
};

function animate(context,resolution){
  
    let lasttime = performance.now();
    
    function loop(timestamp){

        const delta = timestamp - lasttime;

        if(delta){

            context.clearRect(0,0,context.canvas.width,context.canvas.height);

            grid = updateGrid(grid);

            drawGrid(context,resolution,grid);

            lasttime = timestamp;

        }

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
};

function initializeSite(){

    const resolution = 5;

    const fallingSandCanvas = document.querySelector(`#FallingSandCanvas`);

    fixCanvas(fallingSandCanvas,devicePixelRatio);

    const fallingSandCanvasContext = fallingSandCanvas.getContext('2d');

    const fallingSandCanvasWidth = fallingSandCanvas.width;

    const fallingSandCanvasHeight = fallingSandCanvas.height;

    const columns = Math.floor(fallingSandCanvasWidth / resolution);

    const rows = Math.floor(fallingSandCanvasHeight / resolution);

    grid = make2dArray(columns,rows);

    fallingSandCanvas.addEventListener('pointermove', (event)=>{

        event.preventDefault();

        const { clientX, clientY } = event;

        const col = Math.floor(clientX * devicePixelRatio / resolution);

        const row = Math.floor(clientY * devicePixelRatio / resolution);

        if(!col || !row) return;

        const range = 5;

        for(let i = -range; i < range; i++){

            for(let j = -range; j < range; j++){

                if(!grid[col + i]) continue;

                grid[col + i][row + j] = hue;
            }
        }

        hue += 0.5;

    });

    console.log(grid);

    //drawGrid(fallingSandCanvasContext,resolution,grid);

    animate(fallingSandCanvasContext,resolution);

};

initializeSite();