// Touch Controls Manager for Mobile
class TouchControls {
  constructor(game) {
    this.game = game;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.minSwipeDistance = 50;
    this.isEnabled = false;
  }

  init() {
    if (!this.isMobile()) return;

    this.isEnabled = true;

    // Lock to landscape
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {
        console.log('Orientation lock not supported');
      });
    }

    // Setup touch areas
    this.setupTouchAreas();

    tts.speak('Chế độ di động đã kích hoạt. Màn hình bên trái để di chuyển, bên phải để dùng kỹ năng');
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  setupTouchAreas() {
    const canvas = this.game.canvas;

    // Left side - movement
    canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
  }

  handleTouchEnd(e) {
    e.preventDefault();

    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < this.minSwipeDistance) {
      // Tap - basic attack or skill buttons
      this.handleTap(this.touchStartX, this.touchStartY);
      return;
    }

    // Swipe gestures
    const screenWidth = window.innerWidth;

    if (this.touchStartX < screenWidth / 2) {
      // Left side - movement
      this.handleMovementSwipe(deltaX, deltaY);
    } else {
      // Right side - skills
      this.handleSkillSwipe(deltaX, deltaY);
    }
  }

  handleMovementSwipe(deltaX, deltaY) {
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Vertical swipe
      if (deltaY < 0) {
        // Swipe up - jump
        this.game.jump();
        tts.speak('Nhảy');
      }
    } else {
      // Horizontal swipe
      if (deltaX < 0) {
        // Swipe left
        this.game.moveLeft();
        tts.speak('Di chuyển trái');
      } else {
        // Swipe right
        this.game.moveRight();
        tts.speak('Di chuyển phải');
      }
    }
  }

  handleSkillSwipe(deltaX, deltaY) {
    // Determine skill based on swipe direction
    let skillIndex = -1;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Vertical swipe
      if (deltaY < 0) {
        skillIndex = 0; // Swipe up - Skill 1
      } else {
        skillIndex = 1; // Swipe down - Skill 2
      }
    } else {
      // Horizontal swipe
      if (deltaX < 0) {
        skillIndex = 2; // Swipe left - Skill 3
      } else {
        skillIndex = 3; // Swipe right - Skill 4
      }
    }

    if (skillIndex >= 0) {
      this.game.useSkill(skillIndex);
    }
  }

  handleTap(x, y) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Left side tap - basic attack
    if (x < screenWidth / 2) {
      this.game.useBasicAttack();
      return;
    }

    // Right side tap - skills
    if (x > screenWidth / 2 && y > screenHeight / 2) {
      // Bottom right - skill area
      const relX = (x - screenWidth / 2) / (screenWidth / 2);
      const relY = (y - screenHeight / 2) / (screenHeight / 2);

      let skillIndex = -1;
      if (relX < 0.5 && relY < 0.5) skillIndex = 0;
      else if (relX >= 0.5 && relY < 0.5) skillIndex = 1;
      else if (relX < 0.5 && relY >= 0.5) skillIndex = 2;
      else skillIndex = 3;

      this.game.useSkill(skillIndex);
    }
  }
}

// Game Client with TTS and Touch Controls
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

    // Touch controls
    this.touchControls = new TouchControls(this);

    // Offline mode
    this.isOfflineMode = false;
    this.gameEngine = null;
    this.aiBot = null;
    this.aiDifficulty = 'medium';
  }

  init() {
    // Connect to Railway server for multiplayer
    const serverUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://web-production-42989.up.railway.app';

    this.socket = io(serverUrl);
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 500;

    this.setupSocketListeners();
    this.setupKeyboardControls();
    this.addMenuSoundEffects();
    this.touchControls.init();

    // Initialize audio and TTS on first user interaction
    document.addEventListener('click', async () => {
      if (!audioManager.initialized) {
        await audioManager.init();
        await audioManager.preloadMenuSounds();
        await audioManager.preloadGameSounds();
        audioManager.playBGMusic('menu', true, 0.2);
        tts.speak('Hệ thống âm thanh đã sẵn sàng');
      }
    }, { once: true });

    // Welcome message
    tts.speak('Chào mừng đến với One Piece Arena. Game đối kháng cho người khiếm thị');

    // Play lobby enter sound after audio is initialized
    setTimeout(() => {
      audioManager.playMenuSound('lobby');
    }, 500);
  }

  // Offline mode methods
  startOfflineGame(difficulty) {
    this.isOfflineMode = true;
    this.aiDifficulty = difficulty;
    this.showScreen('hero-screen');
    const diffNames = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
    tts.speak(`Chế độ chơi đơn, độ khó ${diffNames[difficulty]}. Hãy chọn hero`);
    audioManager.playMenuSound('select');
  }

  selectHeroOffline(heroId) {
    this.selectedHero = heroId;
    this.playerId = 'player1';

    const hero = HEROES[heroId];
    audioManager.playMenuSound('select');
    tts.speak(`Đã chọn ${hero.name}`);

    // Start game immediately
    setTimeout(() => {
      this.startOfflineMatch();
    }, 1000);
  }

  startOfflineMatch() {
    // Create game engine
    this.gameEngine = new ClientGameEngine();

    // Setup players
    const playerHero = HEROES[this.selectedHero];
    const aiHeroIds = Object.keys(HEROES).filter(id => id !== this.selectedHero);
    const aiHeroId = aiHeroIds[Math.floor(Math.random() * aiHeroIds.length)];
    const aiHero = HEROES[aiHeroId];

    const players = [
      {
        id: 'player1',
        name: 'BẠN',
        heroId: this.selectedHero,
        hero: playerHero,
        x: 200,
        y: 350
      },
      {
        id: 'bot_ai',
        name: 'AI BOT',
        heroId: aiHeroId,
        hero: aiHero,
        x: 600,
        y: 350,
        isAI: true
      }
    ];

    this.gameEngine.start(players);

    // Setup AI
    this.aiBot = new AIBot(this.aiDifficulty);

    // Start game
    this.gameState = this.gameEngine.getState();
    this.myPlayer = this.gameEngine.players.get('player1');
    this.enemies = [this.gameEngine.players.get('bot_ai')];

    this.showScreen('game-screen');
    this.updateGameInfo();
    this.updateSkillButtons();
    this.render();
    this.gameLoop();

    // Play battle music
    audioManager.playBGMusic('battleStart', false, 0.4);
    setTimeout(() => {
      audioManager.playBGMusic('battle', true, 0.3);
    }, 35000); // After battle start music ends

    tts.speak(`Trận đấu bắt đầu! Bạn là ${playerHero.name}, đối thủ là ${aiHero.name}`, true);
  }

  backToLobby() {
    this.isOfflineMode = false;
    this.selectedHero = null;
    audioManager.stopBGMusic();
    audioManager.playBGMusic('menu', true, 0.2);
    this.showScreen('lobby-screen');
    tts.speak('Quay lại sảnh chờ');
    audioManager.playMenuSound('back');
  }

  setupSocketListeners() {
    this.socket.on('connected', (data) => {
      this.playerId = data.playerId;
      this.updateOnlineCount(data.onlinePlayers);
      this.updateRoomList(data.availableRooms);
      tts.speak(`Đã kết nối. ${data.onlinePlayers} người đang online`);
    });

    this.socket.on('playerCount', (count) => {
      this.updateOnlineCount(count);
    });

    this.socket.on('roomCreated', (data) => {
      this.currentRoom = data.room;
      this.showScreen('room-screen');
      document.getElementById('room-mode').textContent = data.room.mode.toUpperCase();
      this.updatePlayersInRoom();
      tts.speak(`Đã tạo phòng ${data.room.mode}. Hãy chọn hero`);
    });

    this.socket.on('roomListUpdate', (rooms) => {
      this.updateRoomList(rooms);
    });

    this.socket.on('playerJoined', (data) => {
      this.currentRoom = data.room;
      this.updatePlayersInRoom();
      tts.speak('Có người chơi mới vào phòng');
    });

    this.socket.on('heroSelected', (data) => {
      if (data.playerId === this.playerId) {
        this.selectedHero = data.heroId;
        document.getElementById('ready-btn').disabled = false;

        // Preload hero sounds
        audioManager.preloadHeroSounds(data.heroId);
        audioManager.playVoice(data.heroId, 0);

        const heroNames = {
          luffy: 'Luffy Gear 5',
          zoro: 'Zoro Timeskip',
          sanji: 'Sanji Raid Suit'
        };
        tts.speak(`Đã chọn ${heroNames[data.heroId]}. Nhấn sẵn sàng để bắt đầu`);
      }
      this.updatePlayersInRoom();
    });

    this.socket.on('playerReadyUpdate', () => {
      this.updatePlayersInRoom();
      tts.speak('Người chơi đã sẵn sàng');
    });

    this.socket.on('gameStart', (gameState) => {
      this.gameState = gameState;
      this.startGame();
      tts.speak('Trận đấu bắt đầu!', true);
    });

    this.socket.on('skillUsed', (data) => {
      this.handleSkillUsed(data);
    });

    this.socket.on('damageDealt', (data) => {
      this.handleDamageDealt(data);
    });

    this.socket.on('playerMoved', (data) => {
      const enemy = this.enemies.find(e => e.id === data.playerId);
      if (enemy) {
        enemy.position = { x: data.x, y: data.y };
      }
    });

    this.socket.on('playerDodged', (data) => {
      if (data.playerId !== this.playerId) {
        audioManager.playDodge();
        tts.speak('Đối thủ né tránh');
      }
    });

    this.socket.on('playerLeft', () => {
      if (this.currentRoom) {
        this.updatePlayersInRoom();
        tts.speak('Người chơi đã rời phòng');
      }
    });

    this.socket.on('error', (data) => {
      tts.speak(data.message, true);
      alert(data.message);
    });
  }

  setupKeyboardControls() {
    // Menu navigation with arrow keys
    document.addEventListener('keydown', (e) => {
      // If not in game, handle menu navigation
      if (!this.gameState || !this.myPlayer) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigateMenu(e.key);
          audioManager.playMenuSound('navigate');
          return;
        }

        if (e.key === 'Enter' && document.activeElement.tagName === 'BUTTON') {
          e.preventDefault();
          audioManager.playMenuSound('enter');
          document.activeElement.click();
          return;
        }
      }

      // Game controls
      const arrowKeyMap = {
        'ArrowLeft': 'a',
        'ArrowRight': 'd',
        'ArrowUp': 'w',
        'ArrowDown': 's'
      };

      let key = e.key.toLowerCase();

      // Convert arrow keys to movement keys in game
      if (arrowKeyMap[e.key] && this.gameState && this.myPlayer) {
        key = arrowKeyMap[e.key];
      }

      this.keys[key] = true;

      if (this.gameState && this.myPlayer) {
        const keyMap = { 'q': 0, 'w': 1, 'e': 2, 'r': 3 };
        const skillIndex = keyMap[key];

        if (skillIndex !== undefined) {
          this.useSkill(skillIndex);
        }

        if (key === 'a') {
          this.useBasicAttack();
        }

        if (e.key === ' ' && !this.isJumping) {
          this.jump();
        }

        if (e.key === 'Shift' && !this.isDodging && Date.now() - this.dodgeCooldown > 3000) {
          this.dodge();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      // Map arrow keys to movement keys
      const arrowKeyMap = {
        'ArrowLeft': 'a',
        'ArrowRight': 'd',
        'ArrowUp': 'w',
        'ArrowDown': 's'
      };

      let key = e.key.toLowerCase();

      // Convert arrow keys to movement keys
      if (arrowKeyMap[e.key]) {
        key = arrowKeyMap[e.key];
      }

      this.keys[key] = false;
    });
  }

  navigateMenu(direction) {
    const focusableElements = Array.from(document.querySelectorAll(
      'button:not([disabled]), .hero-card, a[href]'
    )).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 &&
             window.getComputedStyle(el).visibility !== 'hidden' &&
             window.getComputedStyle(el).display !== 'none';
    });

    if (focusableElements.length === 0) return;

    let currentIndex = focusableElements.indexOf(document.activeElement);

    if (currentIndex === -1) {
      focusableElements[0].focus();
      return;
    }

    let nextIndex = currentIndex;

    if (direction === 'ArrowDown' || direction === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % focusableElements.length;
    } else if (direction === 'ArrowUp' || direction === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    }

    focusableElements[nextIndex].focus();
  }

  addMenuSoundEffects() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        audioManager.playMenuSound('hover');
      });

      btn.addEventListener('click', () => {
        audioManager.playMenuSound('click');
      });

      btn.addEventListener('focus', () => {
        const text = btn.textContent || btn.innerText;
        tts.speak(text);
      });
    });

    document.querySelectorAll('.hero-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        audioManager.playMenuSound('hover');
      });

      card.addEventListener('focus', () => {
        const heroName = card.querySelector('.hero-name').textContent;
        tts.speak(heroName);
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
      tts.speak('Chưa có phòng nào. Hãy tạo phòng mới');
      return;
    }

    tts.speak(`Có ${rooms.length} phòng đang chờ`);

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
      const isBot = pid.startsWith('bot_');
      const playerName = isMe ? 'Bạn' : (isBot ? 'AI Bot' : 'Đối thủ');

      div.innerHTML = `<span>${playerName}</span><span>Đang chọn hero...</span>`;
      container.appendChild(div);
    });
  }

  createRoom(mode, withAI = false, aiDifficulty = 'medium') {
    this.socket.emit('createRoom', { mode, withAI, aiDifficulty });
    tts.speak(`Đang tạo phòng ${mode}`);
  }

  showAIDifficulty(mode) {
    this.pendingAIMode = mode;
    document.getElementById('ai-modal').style.display = 'block';
    document.getElementById('ai-overlay').style.display = 'block';
    tts.speak('Chọn độ khó AI: Dễ, Trung bình, hoặc Khó');
  }

  closeAIModal() {
    document.getElementById('ai-modal').style.display = 'none';
    document.getElementById('ai-overlay').style.display = 'none';
    this.pendingAIMode = null;
  }

  createRoomWithAI(difficulty) {
    if (this.pendingAIMode) {
      this.createRoom(this.pendingAIMode, true, difficulty);
      this.closeAIModal();
      const diffNames = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
      tts.speak(`Đã chọn độ khó ${diffNames[difficulty]}`);
    }
  }

  joinRoom(roomId) {
    this.socket.emit('joinRoom', { roomId });
    this.showScreen('room-screen');
    tts.speak('Đang vào phòng');
  }

  leaveRoom() {
    if (this.currentRoom) {
      this.socket.emit('leaveRoom', { roomId: this.currentRoom.id });
    }
    this.currentRoom = null;
    this.selectedHero = null;
    this.gameState = null;
    this.showScreen('lobby-screen');
    tts.speak('Đã rời phòng');
  }

  selectHero(heroId) {
    document.querySelectorAll('.hero-card').forEach(card => {
      card.classList.remove('selected');
    });
    event.target.closest('.hero-card').classList.add('selected');

    this.socket.emit('selectHero', { heroId });
  }

  playerReady() {
    if (!this.selectedHero) {
      tts.speak('Hãy chọn hero trước', true);
      return;
    }
    this.socket.emit('playerReady');
    document.getElementById('ready-btn').disabled = true;
    document.getElementById('ready-btn').textContent = 'Đang chờ...';
    tts.speak('Đã sẵn sàng. Đang chờ đối thủ');
  }

  startGame() {
    this.showScreen('game-screen');

    this.myPlayer = this.gameState.players.find(p => p.id === this.playerId);
    this.enemies = this.gameState.players.filter(p => p.id !== this.playerId);

    this.updateGameInfo();
    this.updateSkillButtons();
    this.render();
    this.gameLoop();

    // Play battle music for online mode
    audioManager.playBGMusic('battleStart', false, 0.4);
    setTimeout(() => {
      audioManager.playBGMusic('battle', true, 0.3);
    }, 35000);

    tts.speak(`Máu của bạn: ${this.myPlayer.hp}. Máu đối thủ: ${this.enemies[0].hp}`, true);
  }

  updateGameInfo() {
    const container = document.getElementById('game-info');
    container.innerHTML = '';

    this.gameState.players.forEach(player => {
      const div = document.createElement('div');
      div.className = 'player-status';
      const isMe = player.id === this.playerId;
      const isAI = player.isAI || player.id.startsWith('bot_');
      const label = isMe ? 'BẠN' : (isAI ? 'AI BOT' : 'ĐỐI THỦ');

      div.innerHTML = `
        <div><strong>${label}</strong></div>
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

      btn.addEventListener('focus', () => {
        tts.speak(`Kỹ năng ${idx + 1}: ${skill.name}. Sát thương ${skill.damage}`);
      });
    });
  }

  useSkill(skillIndex) {
    if (!this.myPlayer || !this.enemies[0]) return;

    const now = Date.now();
    const skill = this.myPlayer.skills[skillIndex];

    if (now - this.skillCooldowns[skillIndex] < skill.cooldown) {
      tts.speak('Kỹ năng đang hồi', true);
      return;
    }

    this.skillCooldowns[skillIndex] = now;

    if (this.isOfflineMode) {
      // Client-side skill execution
      this.gameEngine.handlePlayerInput('player1', {
        type: 'skill',
        skillIndex: skillIndex
      });
      this.gameState = this.gameEngine.getState();
      this.updateGameInfo();
    } else {
      // Online mode - send to server
      this.socket.emit('useSkill', {
        skillId: skillIndex,
        targetId: this.enemies[0].id
      });
    }

    audioManager.playSkill(this.myPlayer.heroId, skillIndex);
    tts.speak(`Dùng ${skill.name}. Sát thương ${skill.damage}`);

    this.startCooldownUI(skillIndex, skill.cooldown);
  }

  useBasicAttack() {
    if (!this.myPlayer) return;

    if (this.isOfflineMode) {
      this.gameEngine.handlePlayerInput('player1', {
        type: 'basicAttack'
      });
      this.gameState = this.gameEngine.getState();
      this.updateGameInfo();
    } else {
      // Online mode - send to server
      this.socket.emit('basicAttack', {
        targetId: this.enemies[0]?.id
      });
    }
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
        tts.speak(`Kỹ năng ${skillIndex + 1} đã sẵn sàng`);
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

    const hpFill = document.getElementById(`hp-${targetId}`);
    const hpText = document.getElementById(`hp-text-${targetId}`);

    if (hpFill && hpText) {
      hpFill.style.width = `${(target.hp / target.maxHp) * 100}%`;
      hpText.textContent = target.hp;
    }

    if (targetId === this.playerId) {
      audioManager.playVoice(target.heroId, 5);
      tts.speak(`Bị tấn công! Mất ${damage} máu. Còn ${target.hp} máu`, true);
    } else {
      tts.speak(`Gây ${damage} sát thương. Đối thủ còn ${target.hp} máu`);
    }

    if (target.hp <= 0) {
      this.gameOver(attacker.id === this.playerId);
    }
  }

  handleDamageDealt(data) {
    // Already handled in skillUsed
  }

  gameOver(won) {
    if (this.isOfflineMode && this.gameEngine) {
      this.gameEngine.stop();
    }

    setTimeout(() => {
      if (won) {
        audioManager.playVoice(this.myPlayer.heroId, 6);
        tts.speak('Chiến thắng! Bạn đã thắng trận đấu', true);
        alert('🎉 Bạn thắng!');
      } else {
        audioManager.playVoice(this.myPlayer.heroId, 7);
        tts.speak('Thất bại! Bạn đã thua trận đấu', true);
        alert('💀 Bạn thua!');
      }

      if (this.isOfflineMode) {
        this.backToLobby();
      } else {
        this.leaveRoom();
      }
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
    tts.speak('Né tránh');

    const dodgeDir = this.keys['a'] || this.keys['arrowleft'] ? -1 : 1;
    this.playerPos.x += dodgeDir * 100;

    setTimeout(() => {
      this.isDodging = false;
    }, 300);
  }

  moveLeft() {
    this.keys['a'] = true;
    setTimeout(() => { this.keys['a'] = false; }, 500);
  }

  moveRight() {
    this.keys['d'] = true;
    setTimeout(() => { this.keys['d'] = false; }, 500);
  }

  updateMovement() {
    if (!this.gameState || this.isDodging) return;

    if (this.keys['a'] || this.keys['arrowleft']) {
      this.playerPos.x -= this.moveSpeed;
      this.footstepTimer++;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.playerPos.x += this.moveSpeed;
      this.footstepTimer++;
    }

    if (this.footstepTimer > 15 && this.playerPos.y >= this.ground - 50) {
      audioManager.playFootstep();
      this.footstepTimer = 0;
    }

    this.playerVel.y += this.gravity;
    this.playerPos.y += this.playerVel.y;

    if (this.playerPos.y >= this.ground - 50) {
      this.playerPos.y = this.ground - 50;
      this.playerVel.y = 0;
      this.isJumping = false;
    }

    this.playerPos.x = Math.max(0, Math.min(750, this.playerPos.x));

    this.socket.emit('playerMove', {
      x: this.playerPos.x,
      y: this.playerPos.y
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, this.ground, this.canvas.width, 100);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < this.canvas.width; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }

    if (this.myPlayer) {
      this.ctx.fillStyle = this.isDodging ? '#ffd700' : '#28a745';
      this.ctx.fillRect(this.playerPos.x, this.playerPos.y, 50, 50);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px Arial';
      this.ctx.fillText('YOU', this.playerPos.x + 5, this.playerPos.y - 5);
    }

    this.enemies.forEach((enemy, idx) => {
      const enemyX = enemy.position ? enemy.position.x : 600;
      const enemyY = enemy.position ? enemy.position.y : this.ground - 50;
      const isAI = enemy.isAI || enemy.id.startsWith('bot_');

      this.ctx.fillStyle = isAI ? '#ffa500' : '#ff6b35';
      this.ctx.fillRect(enemyX, enemyY, 50, 50);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(isAI ? 'AI' : 'ENEMY', enemyX + 5, enemyY - 5);
    });
  }

  gameLoop() {
    if (this.gameState) {
      // Update AI in offline mode
      if (this.isOfflineMode && this.aiBot) {
        const botPlayer = this.gameEngine.players.get('bot_ai');
        const playerPlayer = this.gameEngine.players.get('player1');

        const aiAction = this.aiBot.update(botPlayer, playerPlayer, this.gameEngine);
        if (aiAction) {
          this.gameEngine.handlePlayerInput('bot_ai', aiAction);
        }

        // Check game over
        if (botPlayer.hp <= 0) {
          this.gameOver(true);
          return;
        }
        if (playerPlayer.hp <= 0) {
          this.gameOver(false);
          return;
        }

        // Update game state
        this.gameState = this.gameEngine.getState();
        this.myPlayer = playerPlayer;
        this.enemies = [botPlayer];
      }

      this.updateMovement();
      this.render();
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}

const game = new Game();
game.init();
