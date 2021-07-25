import { GAME_DIFFICULTY, ICoordinates, OBSTACLE } from "../interface/common";
import { GameState, IGameState } from "./game-state";
import { Obstacle } from "./obstacle";
import { Player } from "./player";
import { Snake } from "./snake";

export type GameMap = { [gameId: string]: Game };
export interface GameSettings {
  difficulty: GAME_DIFFICULTY;
}
export class Game {
  private colors = [
    '#008000',
    '#425ff8',
    '#f8ec42',
    '#42eef8',
    '#bc42f8',
  ];
  public id = null;
  public state: GameState;

  public tickRate = 10;
  public gridSize = 20;

  constructor(id: string, settings: GameSettings) {
    this.id = id;
    this.state = new GameState(id, this.gridSize, settings.difficulty);

    if (this.state.difficulty >= OBSTACLE.ROCK) {
      this.generateObstacles();
    }
    this.spawnFood();
  }

  start(): void {
    this.state.isStarted = true;
  }

  tick(): IGameState {
    const food = this.state.food;
    Object.values(this.state.players).forEach(player => {
      if (player.pause || player.isDead) {
        player.snake.toggleColor();
        return;
      }

      const snake = player.snake;
      snake.move(this.gridSize, this.state.difficulty);

      const isHitObstacle = this.checkObstaclesHitting(player.id, snake);

      if (isHitObstacle) {
        player.dead();
        this.state.addDiedPlayer(player.id);
        return;
      }

      if (snake.x === food.x && snake.y === food.y) {
        this.spawnFood();
        snake.grow();
        player.setScore(snake.getLength());
        this.state.addGrownPlayer(player.id);
        return;
      }

      snake.body.unshift({ x: snake.x, y: snake.y });
      snake.body.pop();
    });

    this.checkGameEnd();

    const state = this.state.get();
    this.state.clearOneTickData();
    return state;
  }

  join(playerId: string, playerName: string): GameState {
    const color = this.getPlayerColor();
    this.state.players[playerId] = new Player(playerId, playerName, color);
    console.log('Player Join', this.state)
    return this.state;
  }

  spawnFood(): void {
    let coordinates: ICoordinates;
    let isCoordinatesCorrect = false;
    const isRockComplexity = this.state.difficulty >= OBSTACLE.ROCK;
    while (!isCoordinatesCorrect) {
      coordinates = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      }

      isCoordinatesCorrect = (!isRockComplexity || !Object.values(this.state.rocks)
        .some(obstacle => obstacle.x === coordinates.x && obstacle.y === coordinates.y))
        && !Object.values(this.state.players)
          .some(player => player.snake.body
            .some(path => path.x === coordinates.x && path.y === coordinates.y));
    }

    this.state.food.setCoordinates(coordinates);
  }

  generateObstacles(): void {
    const obstacleCount = 5;
    for (let i = 0; i < obstacleCount; i += 1) {
      let coordinates: ICoordinates;
      let isCoordinatesCorrect = false;
      while (!isCoordinatesCorrect) {
        coordinates = {
          x: Math.floor(Math.random() * this.gridSize),
          y: Math.floor(Math.random() * this.gridSize),
        }

        isCoordinatesCorrect = !Object.values(this.state.rocks)
          .some(obstacle => obstacle.x === coordinates.x && obstacle.y === coordinates.y);

        if (isCoordinatesCorrect) {
          this.state.rocks.push(new Obstacle(coordinates));
        }
      }
    }
  }

  playerMove(playerId: string, move: number): void {
    const LEFT = 37;
    const RIGHT = 39;
    const TOP = 38;
    const BOTTOM = 40;
    const player = this.state.players[playerId];

    if (!player) {
      return;
    }

    if (move === LEFT && player.snake.isVerticalDirection()) {
      player.snake.setDirection(-1, 0);
    }

    if (move === RIGHT && player.snake.isVerticalDirection()) {
      player.snake.setDirection(1, 0);
    }

    if (move === TOP && player.snake.isHorizontalDirection()) {
      player.snake.setDirection(0, -1);
    }

    if (move === BOTTOM && player.snake.isHorizontalDirection()) {
      player.snake.setDirection(0, 1);
    }
  }

  playerPause(playerId: string): void {
    const player = this.state.players[playerId];

    if (!player) {
      return;
    }
    player.togglePause();

    console.log('playerPause', this.state);
  }

  playerRespawn(playerId: string): void {
    const player = this.state.players[playerId];

    if (!player) {
      return;
    }

    player.respawn();
  }

  disconnectPlayer(playerId: string): void {
    this.state.players[playerId].disconnect();
  }

  reconnectPlayer(prevPlayerId: string, playerId: string): void {
    const player = this.state.players[prevPlayerId];
    delete this.state.players[prevPlayerId];
    player.reconnect(playerId);
    this.state.players[playerId] = player;
  }

  deletePlayer(playerId: string): void {
    delete this.state.players[playerId];
  }

  checkObstaclesHitting(playerId: string, snake: Snake): boolean {
    const isWallComplexity = this.state.difficulty >= OBSTACLE.WALL;
    const isRockComplexity = this.state.difficulty >= OBSTACLE.ROCK;

    const isWallObstacle = isWallComplexity && (snake.x < 0 || snake.x >= this.gridSize || snake.y < 0 || snake.y >= this.gridSize);
    const isRockObstacle = isRockComplexity && this.state.rocks.some(rock => snake.x === rock.x && snake.y === rock.y);
    const isSelfObstacle = snake.body.some((part, i) => i > 0 && snake.x === part.x && snake.y === part.y);
    const isEnemyObstacle = this.getPlayerEnemies(playerId)
      .some(enemy => enemy.snake.body.some(part => snake.x === part.x && snake.y === part.y));
    return isWallObstacle || isRockObstacle || isSelfObstacle || isEnemyObstacle;
  }

  checkGameEnd(): void {
    this.state.isEnd = Object.values(this.state.players).every(player => player.isDead);
    this.state.isEnd && this.setWinner();
  }

  setWinner(): void {
    const players = Object.values(this.state.players);
    if (!players.length) {
      this.state.winnerName = 'No Winner';
      this.state.winnerScore = 0;
      return;
    }

    if (players.length === 1) {
      this.state.winnerName = players[0].name;
      this.state.winnerScore = players[0].score;
      return;
    }

    const winner = players.sort((p1, p2) => p2.score - p1.score)[0];
    this.state.winnerName = winner.name;
    this.state.winnerScore = winner.score;
  }

  isStarted(): boolean {
    return this.state.isStarted;
  }

  doesPlayerExist(playerId: string): boolean {
    return !!this.state.players[playerId];
  }

  getPlayerEnemies(playerId: string): Player[] {
    return Object.values(this.state.players).filter(player => player.id !== playerId);
  }

  getPlayerIds(): string[] {
    return Object.keys(this.state.players);
  }

  getPlayerColor(): string {
    const index = Math.floor(Math.random() * this.colors.length);
    return this.colors.splice(index, 1)[0];
  }
}
