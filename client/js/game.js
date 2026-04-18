// Game Client
class Game {
  constructor() {
    this.socket = null;
    this.playerId = null;
    this.currentRoom = null;
    this.selectedHero = null;
    this.gameState = null;
    this.canvas = null;
    this.ctx = null;
    this.skillCooldowns = [0, 0, 0, 0];
    this.myPlayer = null;
    this.enemies = [];

    // Movement
    this.playerPos = { x: 100, y: 350 };
    this.playerVel = { x: 0, y: 0 };
    this.keys = {};
    this.isJumping = false;
    this.isDodging = false;
    this.dodgeCooldown = 0;
    this.footstepTimer = 0;

    // Map
    this.ground = 400;
    this.gravity = 0.8;
    this.jumpPower = -15;
    this.moveSpeed = 5;
  }

  init() {
    this.socket = io();
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 500;

    this.setupSocketListeners();
    this.setupKeyboardControls();
    this.addMenuSoundEffects();

    // Initialize audio on first user interaction
    document.addEventListener('click', async () => {
      if (!audioManager.initialized) {
        await audioManager.init();
        await audioManager.preloadMenuSounds();
        await audioManager.preloadGameSounds();
      }
    }, { once: true });
  }

  setupSocketListeners() {
    this.socket.on('connected', (data) => {
      this.playerId = data.playerId;
      this.updateOnlineCount(data.onlinePlayers);
      this.updateRoomList(data.availableRooms);
    });

    this.socket.on('playerCount', (count) => {
      this.updateOnlineCount(count);
    });

    this.socket.on('roomCreated', (data) => {
      this.currentRoom = data.room;
      this.showScreen('room-screen');
      document.getElementById('room-mode').textContent = data.room.mode.toUpperCase();
      this.updatePlayersInRoom();
    });

    this.socket.on('roomListUpdate', (rooms) => {
      this.updateRoomList(rooms);
    });

    this.socket.on('playerJoined', (data) => {
      this.currentRoom = data.room;
      this.updatePlayersInRoom();
    });

    this.socket.on('heroSelected', (data) => {
      if (data.playerId === this.playerId) {
        this.selectedHero = data.heroId;
        document.getElementById('ready-btn').disabled = false;

        // Highlight selected hero
        document.querySelectorAll('.hero-card').forEach(card => {
          card.classList.remove('selected');
        });
        event.target.closest('.hero-card').classList.add('selected');

        // Preload hero sounds
        audioManager.preloadHeroSounds(data.heroId);
        audioManager.playVoice(data.heroId, 0); // Play select voice
      }
      this.updatePlayersInRoom();
    });

    this.socket.on('playerReadyUpdate', () => {
      this.updatePlayersInRoom();
    });

    this.socket.on('gameStart', (gameState) => {
      this.gameState = gameState;
      this.startGame();
    });

    this.socket.on('skillUsed', (data) => {
      this.handleSkillUsed(data);
    });

    this.socket.on('damageDealt', (data) => {
      this.handleDamageDealt(data);
    });

    this.socket.on('playerLeft', () => {
      if (this.currentRoom) {
        this.updatePlayersInRoom();
      }
    });

    this.socket.on('error', (data) => {
      alert(data.message);
    });
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (this.gameState && this.myPlayer) {
        // Skills
        const keyMap = { 'q': 0, 'w': 1, 'e': 2, 'r': 3 };
        const skillIndex = keyMap[e.key.toLowerCase()];

        if (skillIndex !== undefined) {
          this.useSkill(skillIndex);
        }

        // Jump
        if (e.key === ' ' && !this.isJumping) {
          this.jump();
        }

        // Dodge
        if (e.key === 'Shift' && !this.isDodging && Date.now() - this.dodgeCooldown > 3000) {
          this.dodge();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  addMenuSoundEffects() {
    // Add hover sounds to buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        audioManager.playMenuSound('hover');
      });

      btn.addEventListener('click', () => {
        audioManager.playMenuSound('click');
      });
    });

    // Add hover sounds to hero cards
    document.querySelectorAll('.hero-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        audioManager.playMenuSound('hover');
      });
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  updateOnlineCount(count) {
    document.getElementById('online-count').textContent = count;
  }

  updateRoomList(rooms) {
    const container = document.getElementById('room-list-container');
    container.innerHTML = '';

    if (rooms.length === 0) {
      container.innerHTML = '<p style="text-align:center;opacity:0.7;">Chưa có phòng nào</p>';
      return;
    }

    rooms.forEach(room => {
      const div = document.createElement('div');
      div.className = 'room-item';
      div.innerHTML = `
        <div>
          <strong>${room.mode.toUpperCase()}</strong> - ${room.players.length}/${room.maxPlayers} người
        </div>
        <button class="btn btn-primary" onclick="game.joinRoom('${room.id}')">Vào</button>
      `;
      container.appendChild(div);
    });
  }

  updatePlayersInRoom() {
    const container = document.getElementById('players-container');
    container.innerHTML = '';

    if (!this.currentRoom) return;

    this.currentRoom.players.forEach(pid => {
      const div = document.createElement('div');
      div.className = 'player-item';

      const isMe = pid === this.playerId;
      const playerName = isMe ? 'Bạn' : 'Player';

      div.innerHTML = `<span>${playerName}</span><span>Đang chọn hero...</span>`;
      container.appendChild(div);
    });
  }

  createRoom(mode) {
    this.socket.emit('createRoom', { mode });
  }

  joinRoom(roomId) {
    this.socket.emit('joinRoom', { roomId });
    this.showScreen('room-screen');
  }

  leaveRoom() {
    this.currentRoom = null;
    this.selectedHero = null;
    this.showScreen('lobby-screen');
    this.socket.disconnect();
    this.socket.connect();
  }

  selectHero(heroId) {
    this.socket.emit('selectHero', { heroId });
  }

  playerReady() {
    if (!this.selectedHero) return;
    this.socket.emit('playerReady');
    document.getElementById('ready-btn').disabled = true;
    document.getElementById('ready-btn').textContent = 'Đang chờ...';
  }

  startGame() {
    this.showScreen('game-screen');

    // Find my player
    this.myPlayer = this.gameState.players.find(p => p.id === this.playerId);
    this.enemies = this.gameState.players.filter(p => p.id !== this.playerId);

    // Update UI
    this.updateGameInfo();
    this.updateSkillButtons();
    this.render();
    this.gameLoop();
  }

  updateGameInfo() {
    const container = document.getElementById('game-info');
    container.innerHTML = '';

    this.gameState.players.forEach(player => {
      const div = document.createElement('div');
      div.className = 'player-status';
      div.innerHTML = `
        <div><strong>${player.id === this.playerId ? 'BẠN' : 'ĐỐI THỦ'}</strong></div>
        <div>${player.heroId.toUpperCase()}</div>
        <div class="hp-bar">
          <div class="hp-fill" id="hp-${player.id}" style="width: ${(player.hp / player.maxHp) * 100}%"></div>
        </div>
        <div>HP: <span id="hp-text-${player.id}">${player.hp}</span>/${player.maxHp}</div>
      `;
      container.appendChild(div);
    });
  }

  updateSkillButtons() {
    const buttons = document.querySelectorAll('.skill-btn');
    buttons.forEach((btn, idx) => {
      const skill = this.myPlayer.skills[idx];
      btn.querySelector('.skill-name').textContent = skill.name;
    });
  }

  useSkill(skillIndex) {
    if (!this.myPlayer || !this.enemies[0]) return;

    const now = Date.now();
    const skill = this.myPlayer.skills[skillIndex];

    if (now - this.skillCooldowns[skillIndex] < skill.cooldown) return;

    this.skillCooldowns[skillIndex] = now;
    this.socket.emit('useSkill', {
      skillId: skillIndex,
      targetId: this.enemies[0].id
    });

    // Play skill sound
    audioManager.playSkill(this.myPlayer.heroId, skillIndex);

    // Start cooldown UI
    this.startCooldownUI(skillIndex, skill.cooldown);
  }

  startCooldownUI(skillIndex, cooldown) {
    const btn = document.querySelector(`.skill-btn[data-skill="${skillIndex}"]`);
    const cooldownSpan = btn.querySelector('.cooldown');
    btn.disabled = true;

    let remaining = Math.ceil(cooldown / 1000);
    cooldownSpan.textContent = remaining;

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        cooldownSpan.textContent = '';
        btn.disabled = false;
      } else {
        cooldownSpan.textContent = remaining;
      }
    }, 1000);
  }

  handleSkillUsed(data) {
    const { playerId, skillId, targetId } = data;

    const attacker = this.gameState.players.find(p => p.id === playerId);
    const target = this.gameState.players.find(p => p.id === targetId);

    if (!attacker || !target) return;

    const skill = attacker.skills[skillId];
    const damage = skill.damage;

    target.hp = Math.max(0, target.hp - damage);

    // Update HP bar
    const hpFill = document.getElementById(`hp-${targetId}`);
    const hpText = document.getElementById(`hp-text-${targetId}`);

    if (hpFill && hpText) {
      hpFill.style.width = `${(target.hp / target.maxHp) * 100}%`;
      hpText.textContent = target.hp;
    }

    // Play hurt sound for target
    if (targetId === this.playerId) {
      audioManager.playVoice(target.heroId, 5); // Hurt voice
    }

    // Check game over
    if (target.hp <= 0) {
      this.gameOver(attacker.id === this.playerId);
    }
  }

  handleDamageDealt(data) {
    // Already handled in skillUsed
  }

  gameOver(won) {
    setTimeout(() => {
      if (won) {
        audioManager.playVoice(this.myPlayer.heroId, 6); // Victory
        alert('🎉 Bạn thắng!');
      } else {
        audioManager.playVoice(this.myPlayer.heroId, 7); // Defeat
        alert('💀 Bạn thua!');
      }

      this.leaveRoom();
    }, 1000);
  }

  jump() {
    if (this.playerPos.y >= this.ground - 50) {
      this.playerVel.y = this.jumpPower;
      this.isJumping = true;
      audioManager.playJump();
    }
  }

  dodge() {
    this.isDodging = true;
    this.dodgeCooldown = Date.now();
    audioManager.playDodge();

    // Dodge animation
    const dodgeDir = this.keys['a'] || this.keys['arrowleft'] ? -1 : 1;
    this.playerPos.x += dodgeDir * 100;

    setTimeout(() => {
      this.isDodging = false;
    }, 300);
  }

  updateMovement() {
    if (!this.gameState || this.isDodging) return;

    // Horizontal movement
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.playerPos.x -= this.moveSpeed;
      this.footstepTimer++;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.playerPos.x += this.moveSpeed;
      this.footstepTimer++;
    }

    // Play footstep sound
    if (this.footstepTimer > 15 && this.playerPos.y >= this.ground - 50) {
      audioManager.playFootstep();
      this.footstepTimer = 0;
    }

    // Gravity
    this.playerVel.y += this.gravity;
    this.playerPos.y += this.playerVel.y;

    // Ground collision
    if (this.playerPos.y >= this.ground - 50) {
      this.playerPos.y = this.ground - 50;
      this.playerVel.y = 0;
      this.isJumping = false;
    }

    // Boundaries
    this.playerPos.x = Math.max(0, Math.min(750, this.playerPos.x));

    // Sync position to server
    this.socket.emit('playerMove', {
      x: this.playerPos.x,
      y: this.playerPos.y
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, this.ground, this.canvas.width, 100);

    // Draw grid lines
    this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < this.canvas.width; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw my player
    if (this.myPlayer) {
      this.ctx.fillStyle = this.isDodging ? '#ffd700' : '#28a745';
      this.ctx.fillRect(this.playerPos.x, this.playerPos.y, 50, 50);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px Arial';
      this.ctx.fillText('YOU', this.playerPos.x + 5, this.playerPos.y - 5);
    }

    // Draw enemies
    this.enemies.forEach((enemy, idx) => {
      const enemyX = 600;
      const enemyY = this.ground - 50;
      this.ctx.fillStyle = '#ff6b35';
      this.ctx.fillRect(enemyX, enemyY, 50, 50);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText('ENEMY', enemyX + 5, enemyY - 5);
    });
  }

  gameLoop() {
    if (this.gameState) {
      this.updateMovement();
      this.render();
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}

const game = new Game();
game.init();
