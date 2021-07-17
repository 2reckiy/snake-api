import express from 'express';
import * as http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import { Game, GameMap } from './lib/game';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});
const port = 3000;
// const routes: Array<CommonRoutesConfig> = [];
const games: GameMap = {};
const clientGames = {}

// here we are adding middleware to parse all incoming requests as JSON 
app.use(express.json());

// here we are adding middleware to allow cross-origin requests
app.use(cors());

// TODO: logging middleware;

const runningMessage = `Server running at http://localhost:${port}`;
app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage)
});

io.on('connection', (client) => {
  console.log('a user connected');

  client.emit('gamelist', Object.keys(games));

  client.on('creategame', handleNewGame);
  client.on('joingame', handleJoinGame);
  client.on('gameturn', handleGameTurn);
  client.on('playerpause', handlePlayerPause);

  client.on('disconnect', handleDisconnect);

  function handleNewGame() {
    const id = Math.floor(Math.random() * 0xfffffffffffff).toString(16);
    games[id] = new Game(id);
    
    io.emit('gamelist', Object.keys(games));
    client.emit('gameinit', id);

    startGameInterval(games[id]);
  }

  function handleJoinGame({ gameId, playerId }) {
    const game = games[gameId];
    if (!game) {
      return;
    }

    if (!clientGames[client.id]) {
      clientGames[client.id] = {};
    }
    clientGames[client.id][gameId] = playerId;

    game.join(playerId);

    client.emit('gamejoined');
  }

  function handleGameTurn({ gameId, playerId, directionCode }) {
    const game = games[gameId];
    if (!game) {
      return;
    }

    try {
      const move = parseInt(directionCode);
      game.playerMove(playerId, move);
    } catch (e) {
      console.error(e);
      return;
    }    
  }

  function handlePlayerPause({ gameId, playerId }) {
    const game = games[gameId];
    if (!game) {
      return;
    }

    game.playerPause(playerId);

    client.emit('playerpaused', playerId);
  }

  function handleDisconnect() {
    if (clientGames[client.id]) {
      Object.keys(clientGames[client.id]).forEach(gameId => {
        const playerId = clientGames[client.id][gameId];
        const game = games[gameId];
        if (!game) {
          return;
        }
        game.deletePlayer(playerId);
      });

      delete clientGames[client.id];
    }
    console.log('user disconnected');
  }
  
  function startGameInterval(game: Game): void {
    const intervalId = setInterval(() => {
      const state = game.tick();

      if (!state.isEnd) {
        io.emit('gametick', state);
      } else {
        clearInterval(intervalId);
      }
    }, 1000 / game.tickRate);
  }
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});