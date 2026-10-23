import SpritesLoader from "./sprites";
import { NPCManager } from "./npcs";
import CollisionHandler from "./collisions";
import {CELL_DATA, mazeDataType, mazeCellDataType, mazeRowDataType} from "./types";

// Game Config
const GAME_LIVES = 3;
const INVINCIBLE_TIME_MS = 2500;
const INVINCIBLE_BLINKS_MS = 150;
const WINDOW_SIZE = 1.1;
const VIGNETTE_orad = 0.5;
const VIGNETTE_irad = 0.5;
const MAZE_EXTRA = 10;
const CELL_WIDTH = 5;
const MazeOutlineSize = CELL_WIDTH * 1.5; 
const MazeColor = "#532a01";
const MazeOutlineColor = "#311501";
const CELL_SIZE = 75; // fixed
const GRID_WIDTH = 5;
const GRID_COLOR = "rgba(254, 158, 61, 0.05)";
const CharAnimStep = 250;
const camAnimLerp = 0.01;
const playerMoveEff = 2;
const playerScale = 2.15;
const NPC_count = 10;
const NPC_spawnTime = 500;
const NPC_moveSpeedMS = 1000;
const NPC_instantMove = true;

window._isDebugging = false;

// game state
let lives = GAME_LIVES;
let invincibleState = 0;
let showPlayer = true;
let showHearts = true;

// setup
const canvas = document.getElementById("game")      as HTMLCanvasElement;
const ctx = canvas.getContext("2d")                 as CanvasRenderingContext2D;
const startBtn = document.getElementById("play")    as HTMLElement;
startBtn.onclick = () => {
    document.getElementById("uiContainer")?.remove();
    canvas.style.display = "block";
    animate();
};

// MAZE LOGIC
const NPCS = new NPCManager(NPC_count, NPC_spawnTime, NPC_moveSpeedMS, NPC_instantMove);
let currentMaze: mazeDataType = [];
const Collisions = new CollisionHandler();
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
        Math.floor(canvas.width / CELL_SIZE) + MAZE_EXTRA,
        Math.floor(canvas.height / CELL_SIZE) + MAZE_EXTRA
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
    if (pressed_keys["s"]) { // player move down
        if (Collisions.canMoveDown(currentMaze, cellCenterOffsetX, cellCenterOffsetY)) {
            camY -= CELL_SIZE;
            camEffY += CELL_SIZE;
            maze_vshift(1);
            NPCS.posShift(currentMaze, 0, -1);
        }
        delete pressed_keys["s"];
    }
    if (pressed_keys["w"]) { // player move up
        if (Collisions.canMoveUp(currentMaze, cellCenterOffsetX, cellCenterOffsetY)) {
            camY += CELL_SIZE;
            camEffY -= CELL_SIZE;
            maze_vshift(0);
            NPCS.posShift(currentMaze, 0, 1);
        }
        delete pressed_keys["w"];
    }
    if (pressed_keys["d"]) { // player move right
        if (Collisions.canMoveRight(currentMaze, cellCenterOffsetX, cellCenterOffsetY)) {
            camX -= CELL_SIZE;
            camEffX += CELL_SIZE;
            maze_hshift(1);
            NPCS.posShift(currentMaze, -1, 0);
        }
        delete pressed_keys["d"];
    }
    if (pressed_keys["a"]) { // player move left
        if (Collisions.canMoveLeft(currentMaze, cellCenterOffsetX, cellCenterOffsetY)) {
            camX += CELL_SIZE;
            camEffX -= CELL_SIZE;
            maze_hshift(0);
            NPCS.posShift(currentMaze, 1, 0);
        }
        delete pressed_keys["a"];
    }
}

// Camera state
let camX = 0; // actual cam vales
let camY = 0;
let camEffX = 0; // values used in lerp for chase anim
let camEffY = 0;

// Characters
const sprites = new SpritesLoader(CharAnimStep);

// Main game loop
let lastFrame = Date.now();
function animate() {
    const now = Date.now();
    const delta = now - lastFrame;
    lastFrame = now;

    sprites.animStep(delta);
    NPCS.step(currentMaze, delta);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
        for (let x = 0; x < canvas.width; x += CELL_SIZE) {
            // draw floor
            const offst = 5;
            ctx.drawImage(sprites.floor.base, x + camEffX - offst, y + camEffY - offst, offst + CELL_SIZE, offst + CELL_SIZE);
        }
    }

    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
        for (let x = 0; x < canvas.width; x += CELL_SIZE) {

            if (window._isDebugging) {
                // this just draws a semi-transparent matrix
                ctx.lineWidth = GRID_WIDTH;
                ctx.strokeStyle = GRID_COLOR;
                ctx.strokeRect(x + camEffX, y + camEffY, CELL_SIZE, CELL_SIZE);
            }

            // cell coordinates calculations
            const cellX = Math.floor(((x - camX) / CELL_SIZE) - cellCenterOffsetX);
            const cellY = Math.floor(((y - camY) / CELL_SIZE) - cellCenterOffsetY);

            // Draw maze
            const mazeCellX = Math.floor(x / CELL_SIZE);
            const mazeCellY = Math.floor(y / CELL_SIZE);

            if (currentMaze[mazeCellY]) {

                const mazeCellData = currentMaze[mazeCellY][mazeCellX];
                ctx.beginPath();

                // only draw left and top as right and bottom will be auto drawn by next cell
                if (!mazeCellData[CELL_DATA.TOP]) {
                    ctx.lineWidth = MazeOutlineSize;
                    ctx.strokeStyle = MazeOutlineColor;
                    ctx.moveTo(x + camEffX - (MazeOutlineSize/2), y + camEffY);
                    ctx.lineTo(x + CELL_SIZE + camEffX + (MazeOutlineSize/2), y + camEffY);
                    ctx.stroke();
                    ctx.strokeStyle = MazeColor;
                    ctx.lineWidth = CELL_WIDTH;
                    ctx.moveTo(x + camEffX, y + camEffY);
                    ctx.lineTo(x + CELL_SIZE + camEffX, y + camEffY);
                    ctx.stroke();
                }
                if (!mazeCellData[CELL_DATA.RIGHT]) {
                    ctx.lineWidth = MazeOutlineSize;
                    ctx.strokeStyle = MazeOutlineColor;
                    ctx.moveTo(x + CELL_SIZE + camEffX, y + camEffY - (MazeOutlineSize/2));
                    ctx.lineTo(x + CELL_SIZE + camEffX, CELL_SIZE + y + camEffY + (MazeOutlineSize/2));
                    ctx.stroke();
                    ctx.strokeStyle = MazeColor;
                    ctx.lineWidth = CELL_WIDTH;
                    ctx.moveTo(x + CELL_SIZE + camEffX, y + camEffY);
                    ctx.lineTo(x + CELL_SIZE + camEffX, CELL_SIZE + y + camEffY);
                    ctx.stroke();
                }
            }

            if (window._isDebugging) {
                // draw coordinates on the cells
                ctx.font = "15px monospace";
                ctx.fillStyle = "red";
                ctx.fillText(cellX.toString(), x + camEffX + 20, y + camEffY + 20);
                ctx.fillStyle = "lime";
                ctx.fillText(cellY.toString(), x + camEffX + 20, y + camEffY + 40);
            }
        }
    }

    // draw player at center
    if (invincibleState > 0) {
        invincibleState -= delta;
        if (invincibleState <= 0) invincibleState = 0;
    } 
    if (showPlayer) {
        const playerSizeReduction = Math.floor(CELL_SIZE * playerScale / 2);
        ctx.drawImage(
            sprites.pumpkin.base,
            (cellCenterOffsetX * CELL_SIZE) + (camEffX / playerMoveEff) + playerSizeReduction,
            (cellCenterOffsetY * CELL_SIZE) + (camEffY / playerMoveEff) + playerSizeReduction,
            CELL_SIZE - playerSizeReduction * 2, CELL_SIZE - playerSizeReduction * 2
        );
    }

    // npcs
    NPCS.draw(ctx, sprites.ghost.base, CELL_SIZE, camEffX, camEffY);
    for(const npc of NPCS.currentNPCs) {
        if((invincibleState <= 0) && npc.x === cellCenterOffsetX && npc.y === cellCenterOffsetY) {
            invincibleState = INVINCIBLE_TIME_MS;
            blink(INVINCIBLE_TIME_MS / INVINCIBLE_BLINKS_MS, INVINCIBLE_BLINKS_MS, (e)=>{
                showPlayer=e;
                showHearts=e;
            });
            lives -= 1;
            if (lives <= 0) {
                alert("gameover");
            }
        }
    }

    camEffX = lerp(camEffX, 0, camAnimLerp * delta);
    camEffY = lerp(camEffY, 0, camAnimLerp * delta);

    // vgrad stuff
    const vcx = canvas.width / 2;
    const vcy = canvas.height / 2;
    const vir = Math.min(canvas.width, canvas.height) * VIGNETTE_irad; 
    const vor = Math.max(canvas.width, canvas.height) * VIGNETTE_orad;
    const vgrad = ctx.createRadialGradient(vcx, vcy, vir, vcx, vcy, vor);
    vgrad.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    vgrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
    ctx.fillStyle = vgrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw hearts
    if (showHearts) {
        const heartDrawSize = CELL_SIZE/3;
        const heartDrawSpacing = CELL_SIZE/2;
        for(let x = heartDrawSize; x < lives*heartDrawSpacing; x+=heartDrawSpacing) {
            ctx.drawImage(sprites.heart.base, x, heartDrawSize, heartDrawSize, heartDrawSize);
        }
    }

    requestAnimationFrame(animate);
};

// Utils
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function blink(times: number, interval: number, valueSetter:(value: boolean)=>void) {
    let val = true;
    let done = times;
    let intervalFn = setInterval(() => {
        if (done <= 0) {
            valueSetter(true);
            return clearInterval(intervalFn);
        }
        valueSetter(val);
        val = !val;
        done -= 1;
    }, interval);
}