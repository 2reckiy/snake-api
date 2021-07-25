import { ISnake, Snake } from "./snake";

export interface IPlayer {
  id: string;
  name: string;
  snake: ISnake;
  score: number;
  pause: boolean;
  isDead: boolean;
  isDisconnected: boolean;
}

export class Player implements IPlayer {
  public id: string;
  public name: string;
  public snake: Snake;
  public score: number;
  public pause: boolean;
  public isDead: boolean;
  public isDisconnected: boolean;

  constructor(id: string, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.snake = new Snake(id, color);
    this.score = 0;
    this.pause = false;
    this.isDead = false;
    this.isDisconnected = false;
  }

  dead(): void {
    this.isDead = true;
  }

  respawn(): void {
    this.isDead = false;
    this.score = 0;
    this.snake.respawn();
  }

  disconnect(): void {
    this.isDisconnected = true;
    this.pause = true;
    console.log(`Plyer: ${this.id} is disconnected`);
  }

  reconnect(newId: string): void {
    this.id = newId;
    this.isDisconnected = false;
    this.snake.updateId(newId);
    console.log(`Plyer: ${newId} is reconnected`);
  }

  setScore(score: number): void {
    this.score = score;
  }

  togglePause(): void {
    this.pause = !this.pause;

    if (!this.pause) {
      this.snake.setDefauleColor();
    }
  }
}
