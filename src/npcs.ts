import { mazeDataType } from "./types.ts";

enum moveDir {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT
}

export default class NPC {
    x: number;
    y: number;
    moveDir: number; // 0-3 -> top, right, bottom, left

    constructor(px: number, py: number) {
        this.x = px;
        this.y = py;
        this.moveDir = Math.floor(Math.random()*4);
    }

    move(maze: mazeDataType) {
        switch(this.moveDir) {
            case moveDir.TOP:
                break;
        }
    }
}