const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Lightweight state - only for matchmaking
const players = new Map();
const rooms = new Map();
let roomIdCounter = 1;

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  players.set(socket.id, {
    id: socket.id,
    name: `Player${players.size + 1}`,
    hero: null,
    room: null,
    ready: false
  });

  // Send current lobby state
  socket.emit('connected', {
    playerId: socket.id,
    onlinePlayers: players.size,
    availableRooms: Array.from(rooms.values()).filter(r => r.status === 'waiting')
  });

  // Broadcast player count
  io.emit('playerCount', players.size);

  // Create room
  socket.on('createRoom', (data) => {
    const { mode } = data;
    const maxPlayers = mode === '1v1' ? 2 : 4;

    const roomId = `room_${roomIdCounter++}`;
    const room = {
      id: roomId,
      mode,
      maxPlayers,
      players: [socket.id],
      status: 'waiting'
    };

    rooms.set(roomId, room);
    players.get(socket.id).room = roomId;

    socket.join(roomId);
    socket.emit('roomCreated', { roomId, room });
    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
  });

  // Join room
  socket.on('joinRoom', (data) => {
    const { roomId } = data;
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    room.players.push(socket.id);
    players.get(socket.id).room = roomId;

    socket.join(roomId);
    io.to(roomId).emit('playerJoined', {
      playerId: socket.id,
      room
    });

    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
  });

  // Leave room
  socket.on('leaveRoom', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    const room = rooms.get(player.room);
    if (room) {
      room.players = room.players.filter(pid => pid !== socket.id);

      if (room.players.length === 0) {
        rooms.delete(player.room);
      } else {
        io.to(player.room).emit('playerLeft', { playerId: socket.id });
      }
    }

    socket.leave(player.room);
    player.room = null;
    player.hero = null;
    player.ready = false;

    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
  });

  // Select hero
  socket.on('selectHero', (data) => {
    const { heroId } = data;
    const player = players.get(socket.id);

    if (!player || !player.room) return;

    player.hero = heroId;
    const room = rooms.get(player.room);

    io.to(player.room).emit('heroSelected', {
      playerId: socket.id,
      heroId,
      room
    });
  });

  // Player ready
  socket.on('playerReady', () => {
    const player = players.get(socket.id);
    if (!player || !player.room || !player.hero) return;

    player.ready = true;
    const room = rooms.get(player.room);

    io.to(player.room).emit('playerReadyUpdate', {
      playerId: socket.id,
      ready: true
    });

    // Check if all players ready
    const allReady = room.players.every(pid => players.get(pid).ready);
    const roomFull = room.players.length === room.maxPlayers;

    if (allReady && roomFull) {
      startGame(room);
    }
  });

  // Game actions - just relay to other players
  socket.on('playerMove', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    socket.to(player.room).emit('playerMoved', {
      playerId: socket.id,
      ...data
    });
  });

  socket.on('useSkill', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    socket.to(player.room).emit('skillUsed', {
      playerId: socket.id,
      ...data
    });
  });

  socket.on('damageDealt', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    socket.to(player.room).emit('damageDealt', {
      ...data
    });
  });

  socket.on('gameOver', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    io.to(player.room).emit('gameOver', {
      winnerId: data.winnerId
    });

    // Clean up room
    const room = rooms.get(player.room);
    if (room) {
      room.status = 'finished';
      setTimeout(() => {
        rooms.delete(player.room);
      }, 5000);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    const player = players.get(socket.id);
    if (player && player.room) {
      const room = rooms.get(player.room);
      if (room) {
        room.players = room.players.filter(pid => pid !== socket.id);

        if (room.players.length === 0) {
          rooms.delete(player.room);
        } else {
          io.to(player.room).emit('playerLeft', { playerId: socket.id });
        }
      }
    }

    players.delete(socket.id);
    io.emit('playerCount', players.size);
    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
  });
});

function startGame(room) {
  room.status = 'playing';

  const gamePlayers = room.players.map(pid => {
    const p = players.get(pid);
    return {
      id: pid,
      name: p.name,
      heroId: p.hero
    };
  });

  io.to(room.id).emit('gameStart', {
    players: gamePlayers
  });

  io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: Lightweight relay server (game logic on client)`);
});
