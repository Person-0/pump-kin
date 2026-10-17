// Game Config
const WINDOW_SIZE   =   1.15;
const CELL_SIZE     =   50;
const INPUT_RATE_ms =   100;
let _isDebugging    =   true;

// MAZE LOGIC
let mazeSizeExtra = 5;
const CELL_STATS = {
    "UNCONNECTED": 1,
    "LEFTCONNECTED": 2,
    "TOPCONNECTED": 3,
    "LTCONNECTED": 4
}
let currentMaze = [];
const coinflip = () => Math.random() >= 0.5; // 50% chance for true or false

// still wip, does not work properly
const generateRow = (width, refRow) => {
    const row = [];
    for(let x = 0; x < width; x++) {
        let cellStat = CELL_STATS.UNCONNECTED;
        if (x > 0 && coinflip()) {
            cellStat = CELL_STATS.LEFTCONNECTED;
        }
        if (refRow) {
            let addTopConnection = coinflip();
            if (
                !addTopConnection &&
                refRow[x+1] &&
                !(refRow[x+1] === CELL_STATS.LEFTCONNECTED)
            ) {
                // last cell in the above set, checking if it is connected
                // as we require atleast 1 connection
                let connFound = false;
                for (let xi = x; xi > -1; xi-=1) {
                    if (refRow[xi] === CELL_STATS.UNCONNECTED) break;
                    if (row[xi] === CELL_STATS.TOPCONNECTED || row[xi] === CELL_STATS.LTCONNECTED) {
                        connFound = true;
                    }
                }
                if (!connFound) addTopConnection = true;
            }
            if (addTopConnection) {
                cellStat = CELL_STATS.LEFTCONNECTED ? CELL_STATS.LTCONNECTED : CELL_STATS.TOPCONNECTED;
            }
        }
        row.push(cellStat);
    }
    return row;
}

// wip
const generateColumn = (height, refCol) => {

}

const generateMaze = (width, height) => {
    const result = [];
    for(let i = 0; i < height; i++) {
        const newRow = generateRow(width, result[i-1]);
        result.push(newRow);
    }
    return result;
}

// maze vertical shift
// pos => 1: bottom, 0: top
// bottom -> remove top row, add a row on bottom
// top -> remove bottom row, add a row on top
const maze_vshift = (pos) => {
    let refRow;
    if (pos) {
        refRow = currentMaze[currentMaze.length-1];
        currentMaze.shift();
        currentMaze.push(generateRow(currentMaze[0].length, refRow));
    } else {
        refRow = currentMaze[0];
        currentMaze.pop();
        generateRow(refRow);
        currentMaze.unshift(generateRow(currentMaze[0].length, refRow));
    }
}

// wip
// maze horizontal shift
// pos => 1: right, 0: left
// right -> remove leftmost column, add a column at right
// left -> remove rightmost column, add a column at left
const maze_hshift = (pos) => {
    let refCol;
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
    currentMaze = generateMaze(
        Math.floor(canvas.width  / CELL_SIZE) + mazeSizeExtra,
        Math.floor(canvas.height / CELL_SIZE) + mazeSizeExtra
    );
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
    if (pressed_keys["s"]) {
        camY -= CELL_SIZE;
        camEffY += CELL_SIZE;
        maze_vshift(1);
    }
    if (pressed_keys["w"]) {
        camY += CELL_SIZE;
        camEffY -= CELL_SIZE;
        maze_vshift(0);
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
            ctx.strokeStyle = "rgba(255,255,255,0.025)";
            ctx.strokeRect(x + camEffX, y + camEffY, CELL_SIZE, CELL_SIZE);

            // cell coordinates calculations
            const cellX = Math.floor(((x - camX) / CELL_SIZE) - cellCenterOffsetX);
            const cellY = Math.floor(((y - camY) / CELL_SIZE) - cellCenterOffsetY);

            // draw maze
            const mazeCellX = Math.floor(x / CELL_SIZE);
            const mazeCellY = Math.floor(y / CELL_SIZE);
            if (currentMaze[mazeCellY]) {
                const mazeCellData = currentMaze[mazeCellY][mazeCellX];
                let drawLeft = mazeCellData === CELL_STATS.LEFTCONNECTED;
                let drawTop = mazeCellData === CELL_STATS.TOPCONNECTED;
                if (mazeCellData === CELL_STATS.LTCONNECTED) {
                    drawLeft = true;
                    drawTop = true;
                }
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "white";
                ctx.beginPath();
                if (drawTop) {
                    ctx.moveTo(x + camEffX, y + camEffY);
                    ctx.lineTo(x + CELL_SIZE + camEffX, y + camEffY);
                }
                if (drawLeft) {
                    ctx.moveTo(x + camEffX, y + camEffY);
                    ctx.lineTo(x + camEffX, CELL_SIZE + y + camEffY);
                }
                ctx.stroke();
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