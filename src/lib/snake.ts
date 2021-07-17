import { EDirection, ICoordinates } from "../interface/common";

export interface ISnake {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: EDirection;
  body: ICoordinates[];
  color: string;
}

export class Snake implements ISnake {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: EDirection;
  body: ICoordinates[];
  color: string;

  constructor(id: string) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.dx = 1;
    this.dy = 0;
    this.direction = EDirection.R;
    this.body = [{ x: 0, y: 0 }];
    this.color = 'green';
  }

  setDirection(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;

    if (dx > 0) {
      this.direction = EDirection.R;
    }

    if (dx < 0) {
      this.direction = EDirection.L;
    }

    if (dy > 0) {
      this.direction = EDirection.B;
    }

    if (dy < 0) {
      this.direction = EDirection.T;
    }
  }

  move(): void {
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;
  }

  grow(): void {
    this.body.unshift({ x: this.x, y: this.y });
  }

  getLength(): number {
    return this.body.length - 1;
  }

  isVerticalDirection(): boolean {
    return [EDirection.T, EDirection.B].includes(this.direction);
  }

  isHorizontalDirection(): boolean {
    return [EDirection.L, EDirection.R].includes(this.direction);
  }
}