import { EDirection, ICoordinates, OBSTACLE } from "../interface/common";

export interface ISnake {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  direction: EDirection;
  body: ICoordinates[];
  defaultColor: string;
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
  defaultColor: string;
  color: string;

  constructor(id: string, color: string) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.dx = 1;
    this.dy = 0;
    this.direction = EDirection.R;
    this.body = [{ x: 0, y: 0 }];
    this.defaultColor = color;
    this.color = color;
  }

  updateId(newId: string): void {
    this.id = newId;
  }

  setDirection(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
  }

  move(gridSize: number, complexity: number): void {
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;

    if (complexity < OBSTACLE.WALL) {
      if (this.x < 0) {
        this.x = gridSize - 1;
      }

      if (this.x >= gridSize) {
        this.x = 0;
      }

      if (this.y < 0) {
        this.y = gridSize - 1;
      }

      if (this.y >= gridSize) {
        this.y = 0;
      }
    }

    if (this.dx > 0) {
      this.direction = EDirection.R;
    }

    if (this.dx < 0) {
      this.direction = EDirection.L;
    }

    if (this.dy > 0) {
      this.direction = EDirection.B;
    }

    if (this.dy < 0) {
      this.direction = EDirection.T;
    }
  }

  grow(): void {
    this.body.unshift({ x: this.x, y: this.y });
  }

  respawn(): void {
    this.x = 0;
    this.y = 0;
    this.dx = 1;
    this.dy = 0;
    this.direction = EDirection.R;
    this.body = [{ x: 0, y: 0 }];
    this.color = this.defaultColor;
  }

  setDefauleColor(): void {
    this.color = this.defaultColor;
  }

  toggleColor(): void {
    this.color = this.color === this.defaultColor
      ? '#fff'
      : this.defaultColor;
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