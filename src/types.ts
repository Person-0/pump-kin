export enum CELL_DATA { // open = true (1)
    RIGHT,
    TOP
}
export type intBool = 0 | 1;
export type mazeCellDataType = [right: intBool, bottom: intBool];
export type mazeRowDataType = mazeCellDataType[];
export type mazeDataType = mazeRowDataType[];