import { ICoordinates } from "../interface/common";
import { Player } from "./player";

export type PlayerMap = { [playerId: string]: Player};

export interface IGameState {
  id: string;
  players: PlayerMap;
  food: ICoordinates,
  isEnd: boolean;
  gridSize: number;
}

export class GameState implements IGameState {
  public id: string;
  public players: PlayerMap;
  public food: ICoordinates;
  public isEnd: boolean;
  public gridSize: number;

  constructor(id: string, gridSize: number) {
    this.id = id;
    this.players = {};
    this.food = { x: 0, y: 0 };
    this.isEnd = false;
    this.gridSize = gridSize;
  }

  public get(): IGameState {
    return {
      id: this.id,
      isEnd: this.isEnd,
      players: this.players,
      food: this.food,
      gridSize: this.gridSize,
    };
  }
}