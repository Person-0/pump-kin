import { mazeDataType } from "./types.ts";
import CollisionHandler from "./collisions.ts";

enum moveDir {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT
}

const Collisions = new CollisionHandler();

class NPC {
    x: number;
    y: number;
    moveDir: number; // 0-3 -> top, right, bottom, left

    constructor(px: number, py: number) {
        this.x = px;
        this.y = py;
        this.moveDir = Math.floor(Math.random()*4);
    }

    move(maze: mazeDataType) {
        let didMove = false;
        switch(this.moveDir) {
            case moveDir.TOP:
                if (Collisions.canMoveUp(maze, this.x, this.y)) {
                    this.y -= 1;
                    didMove = true;
                }
                break;
            case moveDir.RIGHT:
                if (Collisions.canMoveRight(maze, this.x, this.y)) {
                    this.x += 1;
                    didMove = true;
                }
                break;
            case moveDir.BOTTOM:
                if (Collisions.canMoveDown(maze, this.x, this.y)) {
                    this.y += 1;
                    didMove = true;
                }
                break;
            case moveDir.LEFT:
                if (Collisions.canMoveLeft(maze, this.x, this.y)) {
                    this.x -= 1;
                    didMove = true;
                }
                break;
        }
        if (!didMove) {
            this.moveDir = Math.floor(Math.random()*4);
        }
    }
}

export class NPCManager {
    maxNPCs: number;
    moveSpeedMS: number;
    spawnTime: number;
    spawnTimer = 0;
    moveTimer = 0;
    currentNPCs: NPC[] = [];

    constructor(_maxNPCS: number, _spawnTime: number, _moveSpeedMS: number) {
        this.maxNPCs = _maxNPCS;
        this.spawnTime = _spawnTime;
        this.moveSpeedMS = _moveSpeedMS;
    }

    step(maze: mazeDataType, delta: number) {
        if (this.currentNPCs.length < this.maxNPCs) {
            this.spawnTimer += delta;
            if (this.spawnTimer >= this.spawnTime) {
                this.spawnTimer = 0;
                this.spawn();
            }
        }
        this.moveTimer += delta;
        if (this.moveTimer >= this.moveSpeedMS) {
            this.moveTimer = 0;
            for(const npc of this.currentNPCs) {
                npc.move(maze);
            }
        }
        this._oobCheck(maze);
    }

    draw(
        ctx: CanvasRenderingContext2D,
        texture: HTMLImageElement,
        CELL_SIZE: number,
        xOff: number,
        yOff: number
    ) {
        for(const npc of this.currentNPCs) {
            ctx.drawImage(
                texture,
                (npc.x * CELL_SIZE) + xOff,
                (npc.y * CELL_SIZE) + yOff,
                CELL_SIZE, CELL_SIZE
            );
        }
    }

    spawn() {
        const newNPC = new NPC(0,0);
        this.currentNPCs.push(newNPC);
    }

    posShift(maze: mazeDataType, x: number, y: number) {
        for(let i = 0; i < this.currentNPCs.length; i++) {
            const npc = this.currentNPCs[i];
            npc.x += x;
            npc.y += y;
        }
        this._oobCheck(maze);
    }

    _oobCheck(maze: mazeDataType) {
        for(let i = 0; i < this.currentNPCs.length; i++) {
            const npc = this.currentNPCs[i];
            if (
                npc.x < 0 || npc.x > maze[0].length-1 ||
                npc.y < 0 || npc.y > maze.length-1
            ) {
                this.currentNPCs.splice(i, 1); 
            }
        }
    }
}