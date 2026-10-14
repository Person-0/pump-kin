// Game Config
const WINDOW_SIZE   =   2;
const CELL_SIZE     =   50;
const INPUT_RATE_ms =   100;
let _isDebugging    =   true;
let currentMaze;

const generate_maze = (width, height) => {
    const generated_maze = new Array(height);
    let cellIndex = 0;
    for(let y = 0; y < height; y++) {
        let row = new Array(width).fill(0);
        generated_maze[y] = row;
        for(let x = 0; x < width; x++) {
            let curCellIndex = cellIndex;
            let forcedCellIndex = false;
            if (y > 0 && Math.random() >= 0.5) { // connect top?
                curCellIndex = generated_maze[y-1][x][0];
                forcedCellIndex = true;
            }
            if(x > 0 && Math.random() >= 0.5) { // connect left?
                let duplicates = [];
                let connNext = true;
                for(let xi = x-1; xi > -1; xi -= 1) {
                    const thisCell = generated_maze[y][xi];
                    const thisCellID = thisCell[0];
                    if (connNext) {
                        thisCell[0] = curCellIndex;
                        duplicates.push(thisCellID);
                        connNext = false;
                    } else if (duplicates.includes(thisCellID)) {
                        thisCell[0] = curCellIndex;
                    }
                }
            } else if(!forcedCellIndex){
                cellIndex += 1;
            }
            row[x] = [curCellIndex];
        }
    }
    return generated_maze;
}

// Canvas setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let cellCenterOffsetX;
let cellCenterOffsetY;
const onResize = () => {
    canvas.width = Math.floor(window.innerWidth / WINDOW_SIZE);
    canvas.height = Math.floor(window.innerHeight / WINDOW_SIZE);
    cellCenterOffsetX = Math.floor((canvas.width / 2) / CELL_SIZE);
    cellCenterOffsetY = Math.floor((canvas.height / 2) / CELL_SIZE);
    console.log("Resize called:");
    console.log("Canvas: ", canvas.width, canvas.height, "Center:", cellCenterOffsetX, cellCenterOffsetY);
    currentMaze = generate_maze(Math.floor(canvas.width / CELL_SIZE), Math.floor(canvas.height / CELL_SIZE));
}

onResize();
window.onresize = onResize;

// Inputs
const pressed_keys = {};

const keyEventHandler = (eventName) => {
    return (e) => {
        let key = e.key.toLowerCase();
        if (!key.length) return;
        if (key === " ") {
            key = "space";
        }
        switch(eventName) {
            case "keydown":
                pressed_keys[key] = 1;
                break;
            case "keyup":
                if (pressed_keys[key]) delete pressed_keys[key];
                break;
        }
    }
}

canvas.addEventListener("keydown", keyEventHandler("keydown"));
canvas.addEventListener("keyup", keyEventHandler("keyup"));

const readInputs = () => {
    if (pressed_keys["w"]) {
        camY += CELL_SIZE;
        camEffY -= CELL_SIZE;
    }
    if (pressed_keys["s"]) {
        camY -= CELL_SIZE;
        camEffY += CELL_SIZE;
    }
    if (pressed_keys["d"]) {
        camX -= CELL_SIZE;
        camEffX += CELL_SIZE;
    }
    if (pressed_keys["a"]) {
        camX += CELL_SIZE;
        camEffX -= CELL_SIZE;
    }
}

// Camera state
let camX = 0; // actual cam vales
let camY = 0;
let camEffX = 0; // values used in lerp for chase anim
let camEffY = 0;

// Player state
let lastInputTime = 0;

// Main game loop
let lastFrame = Date.now();
(function animate() {
    const now = Date.now();
    const delta = now - lastFrame;
    lastFrame = now;

    if (now-lastInputTime >= INPUT_RATE_ms) {
        readInputs();
        lastInputTime = now;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < canvas.height; y+=CELL_SIZE) {
        for(let x = 0; x < canvas.width; x+=CELL_SIZE) {

            // this just draws a semi-transparent matrix
            // might remove later if looks better without it
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.strokeRect(x + camEffX, y + camEffY, CELL_SIZE, CELL_SIZE);

            // cell coordinates calculations
            const cellX = Math.floor(((x - camX) / CELL_SIZE) - cellCenterOffsetX);
            const cellY = Math.floor(((y - camY) / CELL_SIZE)  - cellCenterOffsetY);

            ctx.lineWidth = 5;
            ctx.strokeStyle = "white";

            if (currentMaze[cellY] && currentMaze[cellY][cellX]) {
                const mazeCell = currentMaze[cellY][cellX];
                if(cellY > 0) {
                    const topCellData = currentMaze[cellY-1][cellX];
                    if (!(topCellData[0] == mazeCell[0])){
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + CELL_SIZE, y);
                        ctx.stroke();
                    }
                }
                if(cellX > 0) {
                    const leftCellData = currentMaze[cellY][cellX-1];
                    if (!(leftCellData[0] == mazeCell[0])) {
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, y + CELL_SIZE);
                        ctx.stroke();
                    }
                }
            }

            if (_isDebugging) {
                // draw coordinates on the cells
                ctx.font = "15px monospace"; 
                ctx.fillStyle = "red";
                ctx.fillText(cellX, x + camEffX + 20, y + camEffY + 20);
                ctx.fillStyle = "lime";
                ctx.fillText(cellY, x + camEffX + 20, y + camEffY + 40);
            }

            // draw player at center
            ctx.fillStyle = "red";
            ctx.fillRect(
                (cellCenterOffsetX * CELL_SIZE) + camEffX,
                (cellCenterOffsetY * CELL_SIZE) + camEffY,
                CELL_SIZE, CELL_SIZE
            );

        }
    }

    camEffX = lerp(camEffX, 0, 0.0025 * delta);
    camEffY = lerp(camEffY, 0, 0.0025 * delta);

    requestAnimationFrame(animate);
})();

// Utils

function lerp(a, b, t) {
    return a + (b - a)*t;
}