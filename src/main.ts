// Game Config
const WINDOW_SIZE = 1.15;
const CELL_SIZE = 75;
const CELL_WIDTH = 5;
const GRID_WIDTH = 5;
const GRID_COLOR = "rgba(255, 255, 255, 0.025)";
const INPUT_RATE_ms = 100;
const camAnimLerp = 0.03;
const playerMoveEff = 2;
const playerScale = 1.7;
window._isDebugging = false;

// MAZE LOGIC types
type intBool = 0 | 1;
type mazeCellDataType = [right: intBool, bottom: intBool];
type mazeRowDataType = mazeCellDataType[];
type mazeColDataType = mazeRowDataType;
type mazeDataType = mazeRowDataType[];

// MAZE LOGIC
let mazeSizeExtra = 5;
enum CELL_DATA { // open = true (1)
    RIGHT,
    TOP
}
let currMazeID = 0;
let currentMaze: mazeDataType = [];
const coinflip = () => Math.random() >= 0.5; // 50% chance for true or false

const generateRow = (width: number) => {
    const row: mazeRowDataType = [];
    let t = 0;
    for (let x = 0; x < width; x++) {
        const defaultCell: mazeCellDataType = [0, 0];
        defaultCell[CELL_DATA.RIGHT] = 1;
        row.push(defaultCell);
        if (coinflip()) { // stop carving!
            row[x][CELL_DATA.RIGHT] = 0;
            const choice = Math.floor(t + (Math.random() * (x - t + 1))); // random from x to t
            t = x + 1;
            row[choice][CELL_DATA.TOP] = 1;
        }
    }
    return row;
}

// wip
const generateColumn = (height: number, refCol: mazeColDataType): mazeColDataType => {
    return [] as mazeColDataType;
}

const generateMaze = (width: number, height: number) => {
    const result: mazeDataType = [];
    for (let i = 0; i < height; i++) {
        result.push(generateRow(width));
    }
    return result;
}

// maze vertical shift
// pos => 1: bottom, 0: top
// bottom -> remove top row, add a row on bottom
// top -> remove bottom row, add a row on top
const maze_vshift = (pos: number) => {
    if (pos) {
        currentMaze.shift();
        currentMaze.push(generateRow(currentMaze[0].length));
    } else {
        currentMaze.pop();
        currentMaze.unshift(generateRow(currentMaze[0].length));
    }
}

// maze horizontal shift
// pos => 1: right, 0: left
// right -> remove leftmost column, add a column at right
// left -> remove rightmost column, add a column at left
const maze_hshift = (pos: number) => {
    const height = currentMaze.length;
    const generated = generateRow(height);
    for (let y = 0; y < height; y++) {
        if (pos) {
            currentMaze[y].shift();
            currentMaze[y].push(generated[y]);
        } else {
            currentMaze[y].pop();
            currentMaze[y].unshift(generated[y]);
        }
    }
}

// Canvas setup
const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (!ctx) {
    alert("canvas rendering context could not be created!");
    throw "ctx err";
}

let cellCenterOffsetX = 0;
let cellCenterOffsetY = 0;
const onResize = () => {
    canvas.width = Math.floor(window.innerWidth / WINDOW_SIZE);
    canvas.height = Math.floor(window.innerHeight / WINDOW_SIZE);
    cellCenterOffsetX = Math.floor((canvas.width / 2) / CELL_SIZE);
    cellCenterOffsetY = Math.floor((canvas.height / 2) / CELL_SIZE);
    console.log("Resize called:");
    console.log("Canvas: ", canvas.width, canvas.height, "Center:", cellCenterOffsetX, cellCenterOffsetY);
    currentMaze = generateMaze(
        Math.floor(canvas.width / CELL_SIZE) + mazeSizeExtra,
        Math.floor(canvas.height / CELL_SIZE) + mazeSizeExtra
    );
}

onResize();
window.onresize = onResize;

// Inputs
const pressed_keys: Record<string, number> = {};

const keyEventHandler = (eventName: string) => {
    return (e: { key: string }) => {
        let key = e.key.toLowerCase();
        if (!key.length) return;
        if (key === " ") {
            key = "space";
        }
        switch (eventName) {
            case "keydown":
                pressed_keys[key] = 1;
                break;
            case "keyup":
                if (pressed_keys[key]) delete pressed_keys[key];
                break;
        }
        readInputs();
    }
}

canvas.addEventListener("keydown", keyEventHandler("keydown"));
canvas.addEventListener("keyup", keyEventHandler("keyup"));

const readInputs = () => {
    const mx = cellCenterOffsetX;
    const my = cellCenterOffsetY;
    if (pressed_keys["s"]) { // player move down
        if (currentMaze[my+1][mx][CELL_DATA.TOP]) {
            camY -= CELL_SIZE;
            camEffY += CELL_SIZE;
            maze_vshift(1);
        }
        delete pressed_keys["s"];
    }
    if (pressed_keys["w"]) { // player move up
        if (currentMaze[my][mx][CELL_DATA.TOP]) {
            camY += CELL_SIZE;
            camEffY -= CELL_SIZE;
            maze_vshift(0);
        }
        delete pressed_keys["w"];
    }
    if (pressed_keys["d"]) { // player move right
        if (currentMaze[my][mx][CELL_DATA.RIGHT]) {
            camX -= CELL_SIZE;
            camEffX += CELL_SIZE;
            maze_hshift(1);
        }
        delete pressed_keys["d"];
    }
    if (pressed_keys["a"]) { // player move left
        if (currentMaze[my][mx-1][CELL_DATA.RIGHT]) {
            camX += CELL_SIZE;
            camEffX -= CELL_SIZE;
            maze_hshift(0);
        }
        delete pressed_keys["a"];
    }
    console.log(camX, camY);
}

// Camera state
let camX = 0; // actual cam vales
let camY = 0;
let camEffX = 0; // values used in lerp for chase anim
let camEffY = 0;

// Main game loop
let lastFrame = Date.now();
(function animate() {
    const now = Date.now();
    const delta = now - lastFrame;
    lastFrame = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
        for (let x = 0; x < canvas.width; x += CELL_SIZE) {

            // this just draws a semi-transparent matrix
            // might remove later if looks better without it
            ctx.lineWidth = GRID_WIDTH;
            ctx.strokeStyle = GRID_COLOR;
            ctx.strokeRect(x + camEffX, y + camEffY, CELL_SIZE, CELL_SIZE);

            // cell coordinates calculations
            const cellX = Math.floor(((x - camX) / CELL_SIZE) - cellCenterOffsetX);
            const cellY = Math.floor(((y - camY) / CELL_SIZE) - cellCenterOffsetY);

            // Draw maze
            const mazeCellX = Math.floor(x / CELL_SIZE);
            const mazeCellY = Math.floor(y / CELL_SIZE);

            if (currentMaze[mazeCellY]) {

                const mazeCellData = currentMaze[mazeCellY][mazeCellX];

                ctx.lineWidth = CELL_WIDTH;
                ctx.lineCap = "round";
                ctx.strokeStyle = "white";
                ctx.beginPath();

                // only draw left and top as right and bottom will be auto drawn by next cell
                if (!mazeCellData[CELL_DATA.TOP]) {
                    ctx.moveTo(x + camEffX, y + camEffY);
                    ctx.lineTo(x + CELL_SIZE + camEffX, y + camEffY);
                }
                if (!mazeCellData[CELL_DATA.RIGHT]) {
                    ctx.moveTo(x + CELL_SIZE + camEffX, y + camEffY);
                    ctx.lineTo(x + CELL_SIZE + camEffX, CELL_SIZE + y + camEffY);
                }

                ctx.stroke();
            }

            if (window._isDebugging) {
                // draw coordinates on the cells
                ctx.font = "15px monospace";
                ctx.fillStyle = "red";
                ctx.fillText(cellX.toString(), x + camEffX + 20, y + camEffY + 20);
                ctx.fillStyle = "lime";
                ctx.fillText(cellY.toString(), x + camEffX + 20, y + camEffY + 40);
            }

            // draw player at center
            ctx.fillStyle = "red";
            const playerSizeReduction = Math.floor(CELL_SIZE * playerScale / 2);
            ctx.fillRect(
                (cellCenterOffsetX * CELL_SIZE) + (camEffX / playerMoveEff) + playerSizeReduction,
                (cellCenterOffsetY * CELL_SIZE) + (camEffY / playerMoveEff) + playerSizeReduction,
                CELL_SIZE - playerSizeReduction * 2, CELL_SIZE - playerSizeReduction * 2
            );

        }
    }

    camEffX = lerp(camEffX, 0, camAnimLerp * delta);
    camEffY = lerp(camEffY, 0, camAnimLerp * delta);

    requestAnimationFrame(animate);
})();

// Utils
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}