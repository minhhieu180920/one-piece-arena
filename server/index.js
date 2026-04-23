const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { HEROES } = require('../shared/heroes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const players = new Map();
const rooms = new Map();
let roomIdCounter = 1;

app.use(express.static(path.join(__dirname, '../client')));
app.get('/version.json', (req, res) => res.sendFile(path.join(__dirname, '../version.json')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));

function createRoomSnapshot(room) {
  return {
    ...room,
    playersMeta: room.players.map(pid => {
      const player = players.get(pid);
      return {
        id: pid,
        hero: player?.hero || null,
        ready: !!player?.ready
      };
    })
  };
}

function createBattleState(room) {
  return {
    map: {
      y: 5,
      z: 50,
      laneLabels: ['tiền đạo', 'trung lộ', 'hậu tuyến']
    },
    players: room.players.map((pid, index) => {
      const player = players.get(pid);
      const hero = HEROES[player.hero];
      return {
        id: pid,
        name: player.name,
        heroId: player.hero,
        x: index % 2 === 0 ? 220 : 720,
        y: 350,
        hp: hero.hp,
        maxHp: hero.hp,
        chi: hero.maxChi,
        maxChi: hero.maxChi,
        laneIndex: 1,
        laneZ: 50,
        facing: index % 2 === 0 ? 'right' : 'left',
        isMeditating: false,
        isQinggong: false,
        isGuarding: false,
        skills: hero.skills.map(skill => ({ ...skill, lastUsed: 0 }))
      };
    }),
    projectiles: []
  };
}

function getOpponentTargets(room, actorId) {
  return room.battleState.players.filter(player => player.id !== actorId);
}

function updatePlayerState(room, actorId, mutate) {
  const player = room.battleState.players.find(p => p.id === actorId);
  if (!player) return;
  mutate(player);
}

function syncRoomState(room) {
  io.to(room.id).emit('stateSync', room.battleState);
}

function applyPlayerAction(room, actorId, data) {
  if (!room.battleState) return;
  const actor = room.battleState.players.find(p => p.id === actorId);
  if (!actor) return;
  const hero = HEROES[actor.heroId];
  const skills = hero.skills;

  switch (data.type) {
    case 'move': {
      const speed = actor.isQinggong ? hero.qinggongSpeed : hero.moveSpeed;
      actor.x += data.direction === 'left' ? -speed * 6 : data.direction === 'right' ? speed * 6 : 0;
      actor.x = Math.max(50, Math.min(910, actor.x));
      actor.facing = data.direction === 'left' ? 'left' : data.direction === 'right' ? 'right' : actor.facing;
      break;
    }
    case 'jump': {
      actor.y = actor.y === 350 ? 300 : 350;
      break;
    }
    case 'lane': {
      const delta = data.direction === 'up' ? -1 : 1;
      actor.laneIndex = Math.max(0, Math.min(2, actor.laneIndex + delta));
      actor.laneZ = [0, 50, 100][actor.laneIndex];
      break;
    }
    case 'meditate': {
      actor.isMeditating = !!data.enabled;
      if (actor.isMeditating) actor.isQinggong = false;
      actor.chi = Math.min(actor.maxChi, actor.chi + (actor.isMeditating ? 24 : 0));
      break;
    }
    case 'qinggong': {
      if (actor.chi >= 15 || !data.enabled) {
        actor.isQinggong = !!data.enabled;
        if (actor.isQinggong) actor.chi = Math.max(0, actor.chi - 15);
      }
      break;
    }
    case 'basicAttack': {
      getOpponentTargets(room, actorId).forEach(target => {
        if (Math.abs(target.x - actor.x) <= hero.basicAttack.range && Math.abs(target.laneIndex - actor.laneIndex) <= (hero.basicAttack.laneReach || 0)) {
          target.hp = Math.max(0, target.hp - hero.basicAttack.damage);
        }
      });
      break;
    }
    case 'skill': {
      const skill = skills[data.skillIndex];
      if (!skill || actor.chi < (skill.chiCost || 0)) break;
      actor.chi = Math.max(0, actor.chi - (skill.chiCost || 0));
      actor.skills[data.skillIndex].lastUsed = Date.now();
      getOpponentTargets(room, actorId).forEach(target => {
        const withinRange = Math.abs(target.x - actor.x) <= (skill.range || 400);
        const withinLane = Math.abs(target.laneIndex - actor.laneIndex) <= (skill.laneReach || 0);
        if (!withinRange || !withinLane) return;
        if (skill.effectType === 'heal') {
          actor.hp = Math.min(actor.maxHp, actor.hp + (skill.selfHeal || 0));
          actor.chi = Math.min(actor.maxChi, actor.chi + (skill.chiRestore || 0));
          return;
        }
        if (skill.effectType === 'guard') {
          actor.isGuarding = true;
          return;
        }
        if (skill.effectType === 'movement') {
          actor.x += actor.facing === 'right' ? (skill.dashDistance || 0) : -(skill.dashDistance || 0);
          return;
        }
        target.hp = Math.max(0, target.hp - skill.damage);
        if (skill.effectType === 'drain') {
          const drain = Math.min(target.chi, skill.chiDrain || 0);
          target.chi -= drain;
          actor.chi = Math.min(actor.maxChi, actor.chi + drain);
          actor.hp = Math.min(actor.maxHp, actor.hp + (skill.selfHeal || 0));
        }
      });
      break;
    }
  }

  room.battleState.players.forEach(player => {
    if (!player.isMeditating) {
      const heroState = HEROES[player.heroId];
      player.chi = Math.min(player.maxChi, player.chi + (heroState.chiRegen || 4));
    }
  });
}

io.on('connection', socket => {
  players.set(socket.id, { id: socket.id, name: `Player${players.size + 1}`, hero: null, room: null, ready: false });

  socket.emit('connected', {
    playerId: socket.id,
    onlinePlayers: players.size,
    availableRooms: Array.from(rooms.values()).filter(r => r.status === 'waiting').map(createRoomSnapshot)
  });

  io.emit('playerCount', players.size);

  socket.on('createRoom', data => {
    const maxPlayers = data.mode === '1v1' ? 2 : 4;
    const roomId = `room_${roomIdCounter++}`;
    const room = { id: roomId, mode: data.mode, maxPlayers, players: [socket.id], status: 'waiting', battleState: null };
    rooms.set(roomId, room);
    players.get(socket.id).room = roomId;
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, room: createRoomSnapshot(room) });
    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting').map(createRoomSnapshot));
  });

  socket.on('joinRoom', data => {
    const room = rooms.get(data.roomId);
    if (!room) return socket.emit('error', { message: 'Room not found' });
    if (room.players.length >= room.maxPlayers) return socket.emit('error', { message: 'Room is full' });

    room.players.push(socket.id);
    players.get(socket.id).room = data.roomId;
    socket.join(data.roomId);
    io.to(data.roomId).emit('playerJoined', { playerId: socket.id, room: createRoomSnapshot(room) });
    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting').map(createRoomSnapshot));
  });

  socket.on('leaveRoom', () => {
    const player = players.get(socket.id);
    if (!player?.room) return;
    const room = rooms.get(player.room);
    if (room) {
      room.players = room.players.filter(pid => pid !== socket.id);
      if (room.players.length === 0) rooms.delete(player.room);
      else io.to(player.room).emit('playerLeft', { playerId: socket.id, room: createRoomSnapshot(room) });
    }

    socket.leave(player.room);
    player.room = null;
    player.hero = null;
    player.ready = false;
    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting').map(createRoomSnapshot));
  });

  socket.on('selectHero', data => {
    const player = players.get(socket.id);
    if (!player?.room) return;
    player.hero = data.heroId;
    const room = rooms.get(player.room);
    io.to(player.room).emit('heroSelected', { playerId: socket.id, heroId: data.heroId, room: createRoomSnapshot(room) });
  });

  socket.on('playerReady', () => {
    const player = players.get(socket.id);
    if (!player?.room || !player.hero) return;
    player.ready = true;
    const room = rooms.get(player.room);
    io.to(player.room).emit('playerReadyUpdate', { playerId: socket.id, ready: true });
    const allReady = room.players.every(pid => players.get(pid).ready);
    const roomFull = room.players.length === room.maxPlayers;
    if (allReady && roomFull) {
      room.status = 'playing';
      room.battleState = createBattleState(room);
      io.to(room.id).emit('gameStart', room.battleState);
      io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting').map(createRoomSnapshot));
    }
  });

  socket.on('playerAction', data => {
    const player = players.get(socket.id);
    if (!player?.room) return;
    const room = rooms.get(player.room);
    if (!room?.battleState) return;
    applyPlayerAction(room, socket.id, data);
    syncRoomState(room);

    const winner = room.battleState.players.find(p => p.hp <= 0);
    if (winner) {
      const alive = room.battleState.players.find(p => p.hp > 0);
      io.to(room.id).emit('gameOver', { winnerId: alive?.id || null });
    }
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player?.room) {
      const room = rooms.get(player.room);
      if (room) {
        room.players = room.players.filter(pid => pid !== socket.id);
        if (room.players.length === 0) rooms.delete(player.room);
        else io.to(player.room).emit('playerLeft', { playerId: socket.id, room: createRoomSnapshot(room) });
      }
    }

    players.delete(socket.id);
    io.emit('playerCount', players.size);
    io.emit('roomListUpdate', Array.from(rooms.values()).filter(r => r.status === 'waiting').map(createRoomSnapshot));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Mode: relay + lightweight synchronized combat state');
});
