import { GameState, IGameState } from "./game-state";
import { Player } from "./player";

export type GameMap = { [gameId: string]: Game };

export class Game {
  public state: GameState;

  public tickRate = 10;
  public gridSize = 20;

  constructor(id: string) {
    this.state = new GameState(id, this.gridSize);
    this.spawnFood();
  }

  tick(): IGameState {
    const food = this.state.food;
    Object.values(this.state.players).forEach(player => {
      if (player.pause || player.isDead) {
        return;
      }

      const snake = player.snake;
      const head = snake.body[0];

      snake.move();

      const isWallObstacle = head.x < 0 || head.x > this.gridSize || head.y < 0 || head.y > this.gridSize;
      const isSelfObstacle = snake.body.some((part, i) => i > 0 && head.x === part.x && head.y === part.y);
      const isEnemyObstacle = this.getPlayerEnemies(player.id)
        .some(enemy => enemy.snake.body.some(part => head.x === part.x && head.y === part.y));

      if (isWallObstacle || isSelfObstacle || isEnemyObstacle) {
        player.dead();
        this.state.deadPlayers.push(player.id);
        return;
      }

      if (head.x === food.x && head.y === food.y) {
        snake.grow();
        player.setScore(snake.getLength());
        this.spawnFood();
        return;
      }

      snake.body.unshift({ x: snake.x, y: snake.y });
      snake.body.pop();
    });

    this.checkGameEnd();

    return this.state.get();
  }

  join(playerId: string): GameState {
    this.state.players[playerId] = new Player(playerId);

    return this.state;
  }

  spawnFood(): void {
    const food = {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize),
    }

    Object.values(this.state.players).forEach(player => {
      player.snake.body.forEach(path => {
        if (path.x === food.x && path.y === food.y) {
          return this.spawnFood();
        }
      });
    });

    this.state.food = food;
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
  }

  playerRespawn(playerId: string): void {
    const player = this.state.players[playerId];

    if (!player) {
      return;
    }

    player.respawn();
  }

  deletePlayer(playerId: string): void {
    delete this.state.players[playerId];
  }


  checkGameEnd(): void {
    this.state.isEnd = Object.values(this.state.players).every(player => player.isDead);
    this.setWinner();
  }

  getPlayerEnemies(playerId: string): Player[] {
    return Object.values(this.state.players).filter(player => player.id !== playerId);
  }

  setWinner(): void {
    const players = Object.values(this.state.players);
    if (!players.length) {
      this.state.winnerName = 'No Winner';
      this.state.winnerScore = 0;
      return;
    }

    if (players.length === 1) {
      this.state.winnerName = players[0].id;
      this.state.winnerScore = players[0].score;
      return;
    }
    
    const winner = players.sort((p1, p2) => p2.score - p1.score)[0];
    this.state.winnerName = winner.id;
    this.state.winnerScore= winner.score;
  }
}
