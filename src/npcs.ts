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
    instantMove = false;

    constructor(px: number, py: number, instantMove = false) {
        this.x = px;
        this.y = py;
        this.instantMove = instantMove;
        this.moveDir = Math.floor(Math.random()*4);
    }

    _getPossibleMoveDirs(maze: mazeDataType) {
        let allowedDIRS: number[] = [];
        if(Collisions.canMoveLeft(maze, this.x, this.y)) allowedDIRS.push(moveDir.LEFT);
        if(Collisions.canMoveRight(maze, this.x, this.y)) allowedDIRS.push(moveDir.RIGHT);
        if(Collisions.canMoveUp(maze, this.x, this.y)) allowedDIRS.push(moveDir.TOP);
        if(Collisions.canMoveDown(maze, this.x, this.y)) allowedDIRS.push(moveDir.BOTTOM);
        return allowedDIRS;
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
        if (didMove) {
            if (Math.random() >= 0.5) { // chance to change dir
                const allowedDIRS = this._getPossibleMoveDirs(maze);
                this.moveDir = (allowedDIRS)[Math.floor(Math.random()*allowedDIRS.length)];
            }
        } else {
            const allowedDIRS = this._getPossibleMoveDirs(maze);
            if (allowedDIRS.length) {
                this.moveDir = allowedDIRS[Math.floor(Math.random()*allowedDIRS.length)];
                if (this.instantMove) this.move(maze);
            }
        }
    }
}

export class NPCManager {
    maxNPCs: number;
    moveSpeedMS: number;
    instantMove = false;
    spawnTime: number;
    spawnTimer = 0;
    moveTimer = 0;
    currentNPCs: NPC[] = [];

    constructor(_maxNPCS: number, _spawnTime: number, _moveSpeedMS: number, _instantMove: boolean) {
        this.maxNPCs = _maxNPCS;
        this.spawnTime = _spawnTime;
        this.moveSpeedMS = _moveSpeedMS;
        this.instantMove = _instantMove;
    }

    step(maze: mazeDataType, delta: number) {
        if (this.currentNPCs.length < this.maxNPCs) {
            this.spawnTimer += delta;
            if (this.spawnTimer >= this.spawnTime) {
                this.spawnTimer = 0;
                this.spawn(maze);
            }
        }
        this.moveTimer += delta;
        if (this.moveTimer >= this.moveSpeedMS) {
            this.moveTimer = 0;
            for(const npc of this.currentNPCs) {
                npc.move(maze);
            }
            this._oobCheck(maze);
        }
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

    spawn(maze: mazeDataType) {
        const randomX = Math.floor(Math.random() * (maze[0].length));
        const randomY = Math.floor(Math.random() * (maze.length));
        const newNPC = new NPC(randomX, randomY, this.instantMove);
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