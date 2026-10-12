const CELL_SIZE = 37.5;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

onResize();
window.onresize = onResize;

// this just draws a semi-transparent matrix
const drawMatrix = () => {
    for(let y = 0; y < window.innerHeight; y+=CELL_SIZE) {
        for(let x = 0; x < window.innerWidth; x+=CELL_SIZE) {
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.strokeRect(x,y,CELL_SIZE,CELL_SIZE);
        }
    }
}

// main game loop
(function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix();
    requestAnimationFrame(animate);
})();