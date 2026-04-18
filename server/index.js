const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { HEROES } = require('../shared/heroes');
const { AIBot } = require('../shared/ai-bot');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Game state
const players = new Map();
const rooms = new Map();
const aiBots = new Map();
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
    const { mode, withAI, aiDifficulty } = data; // '1v1' or '2v2', withAI, difficulty
    const maxPlayers = mode === '1v1' ? 2 : 4;

    const roomId = `room_${roomIdCounter++}`;
    const room = {
      id: roomId,
      mode,
      maxPlayers,
      players: [socket.id],
      status: 'waiting',
      gameState: null,
      hasAI: withAI || false,
      aiDifficulty: aiDifficulty || 'medium'
    };

    rooms.set(roomId, room);
    players.get(socket.id).room = roomId;

    // Add AI bot if requested
    if (withAI) {
      addAIBot(roomId, room);
    }

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

  // Game actions
  socket.on('useSkill', (data) => {
    const { skillId, targetId } = data;
    const player = players.get(socket.id);

    if (!player || !player.room) return;

    io.to(player.room).emit('skillUsed', {
      playerId: socket.id,
      skillId,
      targetId,
      timestamp: Date.now()
    });
  });

  socket.on('playerMove', (data) => {
    const { x, y } = data;
    const player = players.get(socket.id);

    if (!player || !player.room) return;

    io.to(player.room).emit('playerMoved', {
      playerId: socket.id,
      x,
      y
    });
  });

  socket.on('takeDamage', (data) => {
    const { damage, targetId } = data;
    io.to(players.get(socket.id).room).emit('damageDealt', {
      attackerId: socket.id,
      targetId,
      damage
    });
  });

  socket.on('leaveRoom', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;

    const room = rooms.get(player.room);
    if (room) {
      room.players = room.players.filter(pid => pid !== socket.id);
      socket.leave(player.room);

      if (room.players.length === 0) {
        rooms.delete(player.room);
      } else {
        io.to(player.room).emit('playerLeft', { playerId: socket.id });
      }

      io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
    }

    player.room = null;
    player.hero = null;
    player.ready = false;
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

        io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));
      }
    }

    players.delete(socket.id);
    io.emit('playerCount', players.size);
  });
});

function startGame(room) {
  room.status = 'playing';

  const gameState = {
    players: room.players.map(pid => {
      const p = players.get(pid);
      const hero = HEROES[p.hero];
      return {
        id: pid,
        name: p.name,
        heroId: p.hero,
        hp: hero.hp,
        maxHp: hero.hp,
        skills: hero.skills.map(s => ({ ...s, lastUsed: 0 })),
        isAI: p.isAI || false
      };
    }),
    startTime: Date.now(),
    mode: room.mode
  };

  room.gameState = gameState;

  io.to(room.id).emit('gameStart', gameState);
  io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting'));

  // Start AI loop if room has AI
  if (room.hasAI) {
    startAILoop(room.id);
  }
}

function addAIBot(roomId, room) {
  const botId = `bot_${Date.now()}`;
  const heroes = ['luffy', 'zoro', 'sanji'];
  const randomHero = heroes[Math.floor(Math.random() * heroes.length)];

  // Create AI player
  players.set(botId, {
    id: botId,
    name: 'AI Bot',
    hero: randomHero,
    room: roomId,
    ready: true,
    isAI: true
  });

  // Create AI controller
  const aiBot = new AIBot(botId, randomHero, room.aiDifficulty);
  aiBots.set(botId, aiBot);

  room.players.push(botId);

  io.to(roomId).emit('playerJoined', {
    playerId: botId,
    room
  });

  io.to(roomId).emit('heroSelected', {
    playerId: botId,
    heroId: randomHero,
    room
  });

  io.to(roomId).emit('playerReadyUpdate', {
    playerId: botId,
    ready: true
  });
}

function startAILoop(roomId) {
  const aiInterval = setInterval(() => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') {
      clearInterval(aiInterval);
      return;
    }

    const gameState = room.gameState;
    if (!gameState) return;

    // Find AI bots in this room
    room.players.forEach(pid => {
      const player = players.get(pid);
      if (!player || !player.isAI) return;

      const aiBot = aiBots.get(pid);
      if (!aiBot) return;

      // Get enemies (non-AI players)
      const enemies = gameState.players.filter(p => p.id !== pid);

      // AI decides action
      const action = aiBot.update(gameState, enemies);

      if (action) {
        if (action.type === 'skill') {
          io.to(roomId).emit('skillUsed', {
            playerId: pid,
            skillId: action.skillIndex,
            targetId: action.targetId,
            timestamp: Date.now()
          });
        } else if (action.type === 'move') {
          const moveSpeed = aiBot.config.moveSpeed;
          if (action.direction === 'left') {
            aiBot.position.x -= moveSpeed;
          } else {
            aiBot.position.x += moveSpeed;
          }

          io.to(roomId).emit('playerMoved', {
            playerId: pid,
            x: aiBot.position.x,
            y: aiBot.position.y
          });
        } else if (action.type === 'dodge') {
          io.to(roomId).emit('playerDodged', {
            playerId: pid
          });
        }
      }
    });
  }, 500); // AI updates every 500ms
}

server.listen(PORT, () => {
  console.log(`🎮 One Piece Arena Server running on http://localhost:${PORT}`);
  console.log(`📊 Max players: 7`);
  console.log(`⚔️  Game modes: 1v1, 2v2`);
  console.log(`🤖 AI Bot: Available`);
});
