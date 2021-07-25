export enum EDirection {
  R,
  L,
  T,
  B,
}

export interface ICoordinates {
  x: number;
  y: number;
}

export enum GAME_DIFFICULTY {
  EASY,
  HARD,
  NIGHTMARE,
}

export enum OBSTACLE {
  WALL = 1,
  ROCK = 2,
}