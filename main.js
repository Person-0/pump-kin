// Game Config
const CELL_SIZE     =  50;
const INPUT_RATE_ms = 100;

// Canvas setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let cellCenterOffsetX;
let cellCenterOffsetY;
const onResize = () => {
    canvas.width = Math.floor(window.innerWidth / 1.25);
    canvas.height = Math.floor(window.innerHeight / 1.25);
    cellCenterOffsetX = Math.floor((canvas.width / 2) / CELL_SIZE);
    cellCenterOffsetY = Math.floor((canvas.height / 2) / CELL_SIZE);
    console.log("Resize called:");
    console.log("Canvas: ", canvas.width, canvas.height, "Center:", cellCenterOffsetX, cellCenterOffsetY);
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

            const cellX = Math.floor(((x - camX) / CELL_SIZE) - cellCenterOffsetX);
            const cellY = Math.floor(((y - camY) / CELL_SIZE)  - cellCenterOffsetY);
            ctx.font = "15px monospace"; 
            ctx.fillStyle = "red";
            ctx.fillText(cellX, x + camEffX + 20, y + camEffY + 20);
            ctx.fillStyle = "lime";
            ctx.fillText(cellY, x + camEffX + 20, y + camEffY + 40);

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