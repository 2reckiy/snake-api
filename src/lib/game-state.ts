import { Food } from "./food";
import { Obstacle } from "./obstacle";
import { Player } from "./player";

export type PlayerMap = { [playerId: string]: Player };

export interface IGameState {
  id: string;
  gridSize: number;
  difficulty: number;
  players: PlayerMap;
  food: Food,
  rocks: Obstacle[];
  isEnd: boolean;
  isStarted: boolean;
  winnerName: string;
  winnerScore: number;

  diedNow: string[];
  grownNow: string[];
}

export class GameState implements IGameState {
  public id: string;
  public gridSize: number;
  public difficulty: number;
  public players: PlayerMap;
  public food: Food;
  public rocks: Obstacle[];
  public isEnd: boolean;
  public isStarted: boolean;
  public winnerName: string;
  public winnerScore: number;
  public diedNow: string[];
  public grownNow: string[];

  constructor(id: string, gridSize: number, difficulty: number) {
    this.id = id;
    this.gridSize = gridSize;
    this.difficulty = Number(difficulty);
    this.players = {};
    this.food = new Food();
    this.isEnd = false;
    this.isStarted = false;
    this.winnerName = '';
    this.winnerScore = 0;
    this.rocks = [];
    this.diedNow = [];
    this.grownNow = [];
  }

  public get(): IGameState {
    return {
      id: this.id,
      gridSize: this.gridSize,
      difficulty: this.difficulty,
      isEnd: this.isEnd,
      isStarted: this.isStarted,
      players: this.players,
      food: this.food,
      rocks: this.rocks,
      winnerName: this.winnerName,
      winnerScore: this.winnerScore,
      diedNow: [...this.diedNow],
      grownNow: [...this.grownNow],
    };
  }

  public addDiedPlayer(playerId: string): void {
    this.diedNow.push(playerId);
  }

  public addGrownPlayer(playerId: string): void {
    this.grownNow.push(playerId);
  }

  public clearOneTickData(): void {
    this.diedNow = [];
    this.grownNow = [];
  }
}