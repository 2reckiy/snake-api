import express from 'express';
import cors from 'cors';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Game, GameMap, GameSettings } from './lib/game';

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
  client.on('disconnecting', handleDisconnect);

  function handleGameList() {
    client.emit('gamelist', Object.keys(games));
  }

  function handleNewGame(settings: GameSettings) {
    const id = Math.floor(Math.random() * 0xfffffffffffff).toString(16);
    games[id] = new Game(id, settings);

    io.emit('gamelist', Object.keys(games));
    client.emit('gameinit', id);
  }

  function handleJoinGame({ gameId, playerId, playerName, prevPlayerId }) {
    const game = games[gameId];
    if (!game) {
      client.emit('nogame');
      return;
    }

    if (!clientGames[playerId]) {
      clientGames[playerId] = {};
    }
    clientGames[playerId][gameId] = playerId;

    if (prevPlayerId && game.doesPlayerExist(prevPlayerId)) {
      delete clientGames[prevPlayerId];
      game.reconnectPlayer(prevPlayerId, playerId);
    } else {
      game.join(playerId, playerName);
    }

    // join socket room for the current game
    client.join(gameId);

    if (!game.isStarted()) {
      startGameInterval(game);
    }

    client.emit('gamejoin', !game.state.players[playerId].pause);
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

    client.emit('playerpause');
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
      const gameIds = Object.keys(clientGames[client.id]);
      gameIds.forEach(gameId => {
        // leave socket room for the current game
        client.leave(gameId);

        const playerId = clientGames[client.id][gameId];
        const game = games[gameId];
        if (!game) {
          delete clientGames[client.id][gameId];
          return;
        }
        game.disconnectPlayer(playerId);
      });
    }
    console.log(`user disconnected ${client.id}`);
  }

  function startGameInterval(game: Game): void {
    game.start();
    const intervalId = setInterval(() => {
      const state = game.tick();

      if (!state.isEnd) {
        io.to(game.id).emit('gametick', state);
      } else {
        clearInterval(intervalId);

        games[game.id].getPlayerIds()
          .forEach(playerId => delete clientGames[playerId][game.id]);
        delete games[game.id];

        io.to(game.id).emit('gameend', state);
        io.emit('gamelist', Object.keys(games));
      }
    }, 1000 / game.tickRate);
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server listens to ${PORT}`);
});
