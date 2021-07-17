import { ISnake, Snake } from "./snake";

export interface IPlayer {
  id: string;
  snake: ISnake;
  score: number;
}

export class Player implements IPlayer {
  public id: string;
  public snake: Snake;
  public score: number;
  public isDead: boolean;
  public pause: boolean;

  constructor(id: string) {
    this.id = id;
    this.snake = new Snake(id);
    this.score = 0;
    this.pause = false;
    this.isDead = false;
  }

  dead(): void {
    this.isDead = true;
  }

  setScore(score: number): void {
    this.score = score;
  }

  togglePause(): void {
    this.pause = !this.pause;
  }
}
