const CELL_SIZE = 50;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let cellCenterOffsetX;
let cellCenterOffsetY;

const onResize = () => {
    canvas.width = Math.floor(window.innerWidth / 1.25);
    canvas.height = Math.floor(window.innerHeight / 1.25);
    cellCenterOffsetX = Math.floor((canvas.width / 2) / CELL_SIZE);
    cellCenterOffsetY = Math.floor((canvas.height / 2) / CELL_SIZE);
    console.log("Canvas: ", canvas.width, canvas.height, "Center:", cellCenterOffsetX, cellCenterOffsetY);
}

onResize();
window.onresize = onResize;

let playerX = 0;
let playerY = 0;

// main game loop
let lastFrame = Date.now();
(function animate() {

    const now = Date.now();
    const delta = now - lastFrame;
    lastFrame = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < canvas.height; y+=CELL_SIZE) {
        for(let x = 0; x < canvas.width; x+=CELL_SIZE) {

            // this just draws a semi-transparent matrix
            // might remove later if looks better without it
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            // calculates the actual x,y coords of the cell according to the cell size
            const cellX = Math.floor(x/CELL_SIZE) - cellCenterOffsetX;
            const cellY = Math.floor(y/CELL_SIZE) - cellCenterOffsetY;

            if (cellX === playerX && cellY === playerY) {
                ctx.fillStyle = "red";
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }

        }
    }

    requestAnimationFrame(animate);
})();