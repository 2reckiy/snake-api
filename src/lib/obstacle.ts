import { ICoordinates } from "../interface/common";

export interface IObstacle {
  x: number;
  y: number;
  color: string;
}

export class Obstacle implements IObstacle {
  x: number;
  y: number;
  color: string;

  constructor({ x, y }: ICoordinates) {
    this.x = x;
    this.y = y;
    this.color = '#999999';
  }
}