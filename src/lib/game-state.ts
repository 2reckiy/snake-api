import { ICoordinates } from "../interface/common";
import { Player } from "./player";

export type PlayerMap = { [playerId: string]: Player};

export interface IGameState {
  id: string;
  gridSize: number;
  players: PlayerMap;
  food: ICoordinates,
  isEnd: boolean;
  winnerName: string;
  winnerScore: number;
}

export class GameState implements IGameState {
  public id: string;
  public gridSize: number;
  public players: PlayerMap;
  public food: ICoordinates;
  public isEnd: boolean;
  public winnerName: string;
  public winnerScore: number;
  

  constructor(id: string, gridSize: number) {
    this.id = id;
    this.gridSize = gridSize;
    this.players = {};
    this.food = { x: 0, y: 0 };
    this.isEnd = false;
    this.winnerName = '';
    this.winnerScore = 0;
  }

  public get(): IGameState {
    return {
      id: this.id,
      gridSize: this.gridSize,
      isEnd: this.isEnd,
      players: this.players,
      food: this.food,
      winnerName: this.winnerName,
      winnerScore: this.winnerScore,
    };
  }
}