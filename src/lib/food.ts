import { ICoordinates } from "../interface/common";

export interface IFood {
  x: number;
  y: number;
  color: string;
}

export class Food implements IFood {
  x: number;
  y: number;
  color: string;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.color = '#f84242';
  }

  setCoordinates({ x, y }: ICoordinates): void {
    this.x = x;
    this.y = y;
  }
}