type texture = {
    name: string,
    type: 'normal' | 'animated',
    frames: HTMLImageElement[],
    frameIndex: number,
    base: HTMLImageElement,
    load: ()=>void
}

export default class SpritesLoader {

    animStepMS = 0;

    ghost: texture = {
        name: "ghost",
        type: "animated",
        frames: [new Image(), new Image()],
        frameIndex: 0,
        base: new Image(),
        load: () => {
            this.ghost.base.src = "/resources/ghost_1.png";
            this.ghost.frames[0].src = "/resources/ghost_1.png";
            this.ghost.frames[1].src = "/resources/ghost_2.png";
        }
    };

    pumpkin: texture = {
        name: "pumpkin",
        type: "normal",
        frames: [],
        frameIndex: 0,
        base: new Image(),
        load: () => {
            this.pumpkin.base.src = "/resources/pumpkin.png";
        }
    };

    floor: texture = {
        name: "floor",
        type: "normal",
        frames: [],
        frameIndex: 0,
        base: new Image(),
        load: () => {
            this.floor.base.src = "/resources/floor.png";
        }
    };

    heart: texture = {
        name: "heart",
        type: "normal",
        frames: [],
        frameIndex: 0,
        base: new Image(),
        load: () => {
            this.heart.base.src = "/resources/heart.png";
        }
    };

    constructor(_animStepMS: number) {
        this.animStepMS = _animStepMS;
        this.ghost.load();
        this.pumpkin.load();
        this.floor.load();
        this.heart.load();
    }

    timer = 0;
    animStep(delta: number) {
        this.timer += delta;
        if (this.timer >= this.animStepMS) {
            this.timer = 0;

            this.ghost.frameIndex += 1;
            if (this.ghost.frameIndex >= this.ghost.frames.length) {
                this.ghost.frameIndex = 0;
            }
            this.ghost.base = this.ghost.frames[this.ghost.frameIndex];

        }
    }
}