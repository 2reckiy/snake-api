import express from 'express';
import cors from  'cors';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Game, GameMap } from './lib/game';

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const games: GameMap = {};
const clientGames = {}

io.on('connection', (client: Socket) => {
  console.log('a user connected', client.id);

  client.on('gamelist', handleGameList);
  client.on('creategame', handleNewGame);
  client.on('joingame', handleJoinGame);
  client.on('gameturn', handleGameTurn);
  client.on('playerpause', handlePlayerPause);
  client.on('playerrespawn', handlePlayerRespawn);
  client.on('disconnect', handleDisconnect);

  function handleGameList() {
    client.emit('gamelist', Object.keys(games));
  }

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

    client.emit('gamejoin');
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

    client.emit('playerpause', playerId);
  }

  function handlePlayerRespawn({ gameId, playerId }) {
    const game = games[gameId];
    if (!game) {
      return;
    }

    game.playerRespawn(playerId);

    client.emit('playerrespawn');
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
        delete games[state.id];
        //TODO: clear clients games
        io.emit('gameend', state);
      }
    }, 1000 / game.tickRate);
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server listens to ${PORT}`);
});
