import { CELL_DATA, mazeDataType } from "./types.ts";

export default class CollisionHandler {

    canMoveUp(maze: mazeDataType, x: number, y: number) {
        if (
            y <= 0 || y >= maze.length-2 ||
            x <= 0 || x >= maze[0].length-2
        ) return true;
        return maze[y][x][CELL_DATA.TOP];
    }

    canMoveDown(maze: mazeDataType, x: number, y: number) {
        if (
            y <= 0 || y >= maze.length-2 ||
            x <= 0 || x >= maze[0].length-2
        ) return true;
        return maze[y+1][x][CELL_DATA.TOP];
    }

    canMoveLeft(maze: mazeDataType, x: number, y: number) {
        if (
            y <= 0 || y >= maze.length-2 ||
            x <= 0 || x >= maze[0].length-2
        ) return true;
        return maze[y][x-1][CELL_DATA.RIGHT];
    }

    canMoveRight(maze: mazeDataType, x: number, y: number) {
        if (
            y <= 0 || y >= maze.length-2 ||
            x <= 0 || x >= maze[0].length-2
        ) return true;
        return maze[y][x][CELL_DATA.RIGHT];
    }

}