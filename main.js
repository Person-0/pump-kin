const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

onResize();
window.onresize = onResize;