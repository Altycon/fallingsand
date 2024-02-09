
export const FallingSand = {
    
    resolution: 4,
    spread: 10,
    hue: 0,
    autoColor: true,
    grid: [],
    columns: 0,
    rows: 0,
    colorDisplay: undefined,

    make2dArray: function(){

        const arr = new Array(FallingSand.columns);

        for(let i = 0; i < arr.length; i++){

            arr[i] = new Array(FallingSand.rows).fill(0);
        }

        return arr;
    },
    setActiveColorDisplay: function(hue){

        FallingSand.hue = hue;

        FallingSand.colorDisplay.style.backgroundColor = `hsl(${FallingSand.hue} 100% 50%)`;

    },
    reset: function(context){

        

        FallingSand.grid = FallingSand.make2dArray();
    },
    updateGrid: function(grid){

        const newGrid = grid.map( cell => cell.map( val => 0));

        for(let i = FallingSand.columns - 1; i >= 0; i--){

            for(let j = FallingSand.rows - 1; j >= 0; j--){

                const state = grid[i][j];

                if(state > 0){

                    const below = grid[i][j + 1];


                    let dir = 1;

                    if(Math.random() < 0.5) dir *= -1;
                    
                    let left,right;

                    if(i > 0 && i < FallingSand.columns - 1){

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
    },
    drawGrid: function(context,grid){

        for(let i = FallingSand.columns - 1; i >= 0; i--){

            for(let j = FallingSand.rows - 1; j >= 0; j--){
    
                const cell = grid[i][j];
    
                if(cell > 0){
    
                    context.fillStyle = `hsl(${cell} 100% 50%)`;
    
                    context.fillRect(
                        i * FallingSand.resolution, 
                        j * FallingSand.resolution, 
                        FallingSand.resolution, 
                        FallingSand.resolution
                    );
                }
    
            }
        }
    },
    animate: function(context){

        let lasttime = performance.now();
    
        function loop(timestamp){

            const delta = timestamp - lasttime;

            if(delta){

                context.clearRect(0,0,context.canvas.width,context.canvas.height);

                FallingSand.grid = FallingSand.updateGrid(FallingSand.grid);

                FallingSand.drawGrid(context,FallingSand.grid);

                lasttime = timestamp;

            }

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    },
    addSand(positionX,positionY,spread){

        if(!spread) spread = FallingSand.spread;

        const col = Math.floor(positionX / FallingSand.resolution);

        const row = Math.floor(positionY / FallingSand.resolution);

        if(!col || !row) return;

        for(let i = -spread; i < spread; i++){

            for(let j = -spread; j < spread; j++){

                if(!FallingSand.grid[col + i]) continue;

                if(Math.random() < 0.25) FallingSand.grid[col + i][row + j] = FallingSand.hue;
                
            }
        }

        if(FallingSand.autoColor){

            FallingSand.hue += 1;

            FallingSand.setActiveColorDisplay(FallingSand.hue);
        }
    },
    initialize(width,height,hue,colorDisplay){

        FallingSand.hue = hue;

        FallingSand.colorDisplay = colorDisplay;

        FallingSand.columns = Math.floor(width / FallingSand.resolution);

        FallingSand.rows = Math.floor(height / FallingSand.resolution);

        FallingSand.grid = FallingSand.make2dArray();

        FallingSand.setActiveColorDisplay(hue);

        
    }
}