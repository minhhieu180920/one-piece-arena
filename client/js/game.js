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

    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }

    this.setupTouchAreas();
    tts.speak('Chế độ di động đã kích hoạt. Bên trái để di chuyển, bên phải để dùng kỹ năng');
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  setupTouchAreas() {
    const canvas = this.game.canvas;
    canvas.addEventListener('touchstart', e => this.handleTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove', e => this.handleTouchMove(e), { passive: false });
    canvas.addEventListener('touchend', e => this.handleTouchEnd(e), { passive: false });
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
      this.handleTap(this.touchStartX, this.touchStartY);
      return;
    }

    const screenWidth = window.innerWidth;
    if (this.touchStartX < screenWidth / 2) {
      this.handleMovementSwipe(deltaX, deltaY);
    } else {
      this.handleSkillSwipe(deltaX, deltaY);
    }
  }

  handleMovementSwipe(deltaX, deltaY) {
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) this.game.jump();
    } else if (deltaX < 0) {
      this.game.moveLeft();
    } else {
      this.game.moveRight();
    }
  }

  handleSkillSwipe(deltaX, deltaY) {
    let skillIndex = -1;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      skillIndex = deltaY < 0 ? 0 : 1;
    } else {
      skillIndex = deltaX < 0 ? 2 : 3;
    }

    if (skillIndex >= 0) {
      this.game.useSkill(skillIndex);
    }
  }

  handleTap(x) {
    const screenWidth = window.innerWidth;
    if (x < screenWidth / 2) {
      this.game.useBasicAttack();
    } else {
      this.game.toggleQinggong();
    }
  }
}

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
    this.keys = {};
    this.footstepTimer = 0;
    this.touchControls = new TouchControls(this);
    this.isOfflineMode = false;
    this.gameEngine = null;
    this.aiBot = null;
    this.aiDifficulty = 'medium';
    this.pendingCooldownTimers = new Map();
    this.ground = 400;
    this.laneVisualOffset = 35;
  }

  async init() {
    const serverUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://web-production-42989.up.railway.app';

    this.socket = io(serverUrl);
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 960;
    this.canvas.height = 500;

    this.setupSocketListeners();
    this.setupKeyboardControls();
    this.addMenuSoundEffects();
    this.touchControls.init();

    const initAudio = async () => {
      if (!audioManager.initialized) {
        await audioManager.init();
        await audioManager.preloadMenuSounds();
        await audioManager.preloadGameSounds();
        audioManager.playBGMusic('menu', true, 0.15);
        tts.speak('Hệ thống âm thanh kiếmiệp đã sẵn sàng');
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('mousedown', initAudio, { once: true });
    document.addEventListener('pointerdown', initAudio, { once: true });

    tts.speak('Chào mừng đến với Võ Lâm Đấu Trường');
    setTimeout(() => audioManager.playMenuSound('lobby'), 500);
  }

  hydratePlayer(player) {
    const hero = HEROES[player.heroId];
    const skills = hero.skills.map((skill, idx) => ({
      ...skill,
      lastUsed: player.skills?.[idx]?.lastUsed || 0
    }));

    return {
      ...player,
      hero,
      name: player.name || hero.name,
      maxHp: player.maxHp || hero.hp,
      hp: player.hp ?? hero.hp,
      chi: player.chi ?? hero.maxChi,
      maxChi: player.maxChi || hero.maxChi,
      laneIndex: player.laneIndex ?? 1,
      laneZ: player.laneZ ?? 50,
      isMeditating: !!player.isMeditating,
      isQinggong: !!player.isQinggong,
      isGuarding: !!player.isGuarding,
      skills,
      position: { x: player.x ?? 220, y: player.y ?? this.ground - 50 }
    };
  }

  syncFromState(state) {
    this.gameState = state;
    this.myPlayer = state.players.find(p => p.id === this.playerId) || null;
    this.enemies = state.players.filter(p => p.id !== this.playerId);
  }

  async prepareHeroAudio(heroIds) {
    if (!audioManager.initialized) return;
    await Promise.all(heroIds.map(heroId => audioManager.preloadHeroSounds(heroId)));
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  startOfflineGame(difficulty) {
    this.isOfflineMode = true;
    this.aiDifficulty = difficulty;
    this.showScreen('hero-screen');
    const diffNames = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
    tts.speak(`Chế độ chơi đơn, độ khó ${diffNames[difficulty]}. Hãy chọn nhân vật`);
    audioManager.playMenuSound('select');
  }

  async selectHeroOffline(heroId) {
    this.selectedHero = heroId;
    this.playerId = 'player1';
    const hero = HEROES[heroId];
    audioManager.playMenuSound('select');
    await this.prepareHeroAudio([heroId]);
    audioManager.playVoice(heroId, 'select');
    tts.speak(`Đã chọn ${hero.name}`);
    setTimeout(() => this.startOfflineMatch(), 800);
  }

  async startOfflineMatch() {
    this.gameEngine = new ClientGameEngine();
    const playerHero = HEROES[this.selectedHero];
    const aiHeroIds = Object.keys(HEROES).filter(id => id !== this.selectedHero);
    const aiHeroId = aiHeroIds[Math.floor(Math.random() * aiHeroIds.length)];
    const aiHero = HEROES[aiHeroId];

    await this.prepareHeroAudio([this.selectedHero, aiHeroId]);

    const players = [
      { id: 'player1', name: 'Bạn', heroId: this.selectedHero, hero: playerHero, x: 220, y: 350, laneIndex: 1 },
      { id: 'bot_ai', name: aiHero.name, heroId: aiHeroId, hero: aiHero, x: 720, y: 350, laneIndex: 1, isAI: true }
    ];

    this.gameEngine.start(players);
    this.aiBot = new AIBot(this.aiDifficulty);
    this.syncFromState(this.gameEngine.getState());
    this.showScreen('game-screen');
    this.updateGameInfo();
    this.updateSkillButtons();
    this.render();
    this.gameLoop();
    audioManager.playBGMusic('battleStart', false, 0.3);
    setTimeout(() => {
      audioManager.playBGMusic('battle', true, 0.2);
      audioManager.playAmbientBattle();
    }, 3000);
    tts.speak(`Trận đấu bắt đầu! Bạn là ${playerHero.name}, đối thủ là ${aiHero.name}`, true);
  }

  backToLobby() {
    this.isOfflineMode = false;
    this.selectedHero = null;
    this.currentRoom = null;
    this.gameState = null;
    if (this.gameEngine) this.gameEngine.stop();
    audioManager.stopBGMusic();
    audioManager.playBGMusic('menu', true, 0.15);
    this.showScreen('lobby-screen');
    tts.speak('Quay lại sảnh chờ');
    audioManager.playMenuSound('back');
  }

  setupSocketListeners() {
    this.socket.on('connected', data => {
      this.playerId = data.playerId;
      this.updateOnlineCount(data.onlinePlayers);
      this.updateRoomList(data.availableRooms);
      tts.speak(`Đã kết nối. ${data.onlinePlayers} người đang online`);
    });

    this.socket.on('playerCount', count => this.updateOnlineCount(count));

    this.socket.on('roomCreated', data => {
      this.currentRoom = data.room;
      this.showScreen('room-screen');
      document.getElementById('room-mode').textContent = data.room.mode.toUpperCase();
      this.updatePlayersInRoom();
      tts.speak(`Đã tạo phòng ${data.room.mode}. Hãy chọn nhân vật`);
    });

    this.socket.on('roomListUpdate', rooms => this.updateRoomList(rooms));

    this.socket.on('playerJoined', data => {
      this.currentRoom = data.room;
      this.updatePlayersInRoom();
      tts.speak('Có người chơi mới vào phòng');
    });

    this.socket.on('heroSelected', async data => {
      if (data.playerId === this.playerId) {
        this.selectedHero = data.heroId;
        document.getElementById('ready-btn').disabled = false;
        await this.prepareHeroAudio([data.heroId]);
        audioManager.playVoice(data.heroId, 'select');
        tts.speak(`Đã chọn ${HEROES[data.heroId].name}. Nhấn sẵn sàng để bắt đầu`);
      }
      this.currentRoom = data.room;
      this.updatePlayersInRoom();
    });

    this.socket.on('playerReadyUpdate', data => {
      if (this.currentRoom?.playersMeta) {
        const meta = this.currentRoom.playersMeta.find(p => p.id === data.playerId);
        if (meta) meta.ready = data.ready;
      }
      this.updatePlayersInRoom();
      tts.speak('Người chơi đã sẵn sàng');
    });

    this.socket.on('gameStart', async payload => {
      await this.prepareHeroAudio(payload.players.map(p => p.heroId));
      this.gameState = {
        map: payload.map,
        players: payload.players.map(p => this.hydratePlayer(p)),
        projectiles: []
      };
      this.startGame();
      tts.speak('Trận đấu bắt đầu!', true);
    });

    this.socket.on('stateSync', payload => {
      if (!this.gameState) return;
      this.gameState = {
        ...this.gameState,
        map: payload.map || this.gameState.map,
        players: payload.players.map(p => this.hydratePlayer(p)),
        projectiles: payload.projectiles || []
      };
      this.syncFromState(this.gameState);
      this.updateGameInfo();
    });

    this.socket.on('playerLeft', () => {
      if (this.currentRoom) {
        this.updatePlayersInRoom();
        tts.speak('Người chơi đã rời phòng');
      }
    });

    this.socket.on('error', data => {
      tts.speak(data.message, true);
      alert(data.message);
    });
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', e => {
      if (!this.gameState || !this.myPlayer) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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

      const key = e.key.toLowerCase();
      this.keys[key] = true;

      if (!this.gameState || !this.myPlayer) return;

      const skillMap = { q: 0, w: 1, e: 2, r: 3 };
      if (skillMap[key] !== undefined) this.useSkill(skillMap[key]);
      if (key === 'a') this.useBasicAttack();
      if (key === ' ') this.jump();
      if (key === 'f') this.toggleMeditate();
      if (key === 'z') this.changeLane('up');
      if (key === 'x') this.changeLane('down');
      if (e.key === 'Shift') this.toggleQinggong();
    });

    document.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  navigateMenu(direction) {
    const focusableElements = Array.from(document.querySelectorAll('button:not([disabled]), .hero-card, a[href]')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden' && window.getComputedStyle(el).display !== 'none';
    });

    if (focusableElements.length === 0) return;
    let currentIndex = focusableElements.indexOf(document.activeElement);
    if (currentIndex === -1) {
      focusableElements[0].focus();
      return;
    }

    let nextIndex = currentIndex;
    if (direction === 'ArrowDown' || direction === 'ArrowRight') nextIndex = (currentIndex + 1) % focusableElements.length;
    if (direction === 'ArrowUp' || direction === 'ArrowLeft') nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    focusableElements[nextIndex].focus();
  }

  addMenuSoundEffects() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => audioManager.playMenuSound('hover'));
      btn.addEventListener('click', () => audioManager.playMenuSound('click'));
      btn.addEventListener('focus', () => tts.speak(btn.textContent || btn.innerText));
    });

    document.querySelectorAll('.hero-card').forEach(card => {
      card.addEventListener('mouseenter', () => audioManager.playMenuSound('hover'));
      card.addEventListener('focus', () => {
        const heroName = card.querySelector('.hero-name').textContent;
        tts.speak(heroName);
      });
    });
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

    const playerIds = this.currentRoom.playersMeta || this.currentRoom.players.map(pid => ({ id: pid }));
    playerIds.forEach(playerMeta => {
      const div = document.createElement('div');
      div.className = `player-item ${playerMeta.ready ? 'ready' : ''}`;
      const isMe = playerMeta.id === this.playerId;
      const heroName = playerMeta.hero ? HEROES[playerMeta.hero]?.name : 'Đang chọn nhân vật';
      div.innerHTML = `<span>${isMe ? 'Bạn' : 'Đối thủ'}</span><span>${heroName}</span>`;
      container.appendChild(div);
    });
  }

  createRoom(mode, withAI = false, aiDifficulty = 'medium') {
    this.socket.emit('createRoom', { mode, withAI, aiDifficulty });
    tts.speak(`Đang tạo phòng ${mode}`);
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
    document.querySelectorAll('.hero-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.hero-card').classList.add('selected');
    this.socket.emit('selectHero', { heroId });
  }

  playerReady() {
    if (!this.selectedHero) {
      tts.speak('Hãy chọn nhân vật trước', true);
      return;
    }
    this.socket.emit('playerReady');
    document.getElementById('ready-btn').disabled = true;
    document.getElementById('ready-btn').textContent = 'Đang chờ...';
    tts.speak('Đã sẵn sàng. Đang chờ đối thủ');
  }

  startGame() {
    this.showScreen('game-screen');
    this.gameState.players = this.gameState.players.map(p => this.hydratePlayer(p));
    this.syncFromState(this.gameState);
    this.updateGameInfo();
    this.updateSkillButtons();
    this.render();
    this.gameLoop();
    audioManager.playBGMusic('battleStart', false, 0.3);
    setTimeout(() => {
      audioManager.playBGMusic('battle', true, 0.2);
      audioManager.playAmbientBattle();
    }, 3000);
    tts.speak(`Máu của bạn: ${this.myPlayer.hp}. Nội lực: ${this.myPlayer.chi}`, true);
  }

  updateGameInfo() {
    const container = document.getElementById('game-info');
    container.innerHTML = '';

    this.gameState.players.forEach(player => {
      const div = document.createElement('div');
      div.className = 'player-status';
      const isMe = player.id === this.playerId;
      const laneNames = ['Tiền đạo', 'Trung lộ', 'Hậu tuyến'];
      div.innerHTML = `
        <div><strong>${isMe ? 'BẠN' : 'ĐỐI THỦ'}</strong></div>
        <div>${HEROES[player.heroId].name}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${(player.hp / player.maxHp) * 100}%"></div></div>
        <div>HP: ${player.hp}/${player.maxHp}</div>
        <div class="chi-bar"><div class="chi-fill" style="width:${(player.chi / player.maxChi) * 100}%"></div></div>
        <div>Nội lực: ${Math.round(player.chi)}/${player.maxChi}</div>
        <div>Làn: ${laneNames[player.laneIndex] || 'Trung lộ'}</div>
        <div>Trạng thái: ${player.isMeditating ? 'Điều tức' : player.isQinggong ? 'Khinh công' : player.isGuarding ? 'Hộ thể' : 'Bình thường'}</div>
      `;
      container.appendChild(div);
    });

    const meditateBtn = document.getElementById('meditate-btn');
    const qinggongBtn = document.getElementById('qinggong-btn');
    if (this.myPlayer) {
      meditateBtn.textContent = this.myPlayer.isMeditating ? 'F Dừng điều tức' : 'F Điều tức';
      qinggongBtn.textContent = this.myPlayer.isQinggong ? 'Shift Thu khinh công' : 'Shift Khinh công';
    }
  }

  updateSkillButtons() {
    const buttons = document.querySelectorAll('.skill-btn');
    buttons.forEach((btn, idx) => {
      if (!this.myPlayer) return;

      if (idx === 0) {
        btn.querySelector('.skill-name').textContent = this.myPlayer.hero.basicAttack.name;
        btn.querySelector('.skill-cost').textContent = '0 NL';
      } else {
        const skill = this.myPlayer.skills[idx - 1];
        if (!skill) return;
        btn.querySelector('.skill-name').textContent = skill.name;
        btn.querySelector('.skill-cost').textContent = `${skill.chiCost || 0} NL`;
      }
    });
  }

  startCooldownUI(skillIndex, cooldown) {
    const btn = document.querySelector(`.skill-btn[data-skill="${skillIndex}"]`);
    if (!btn) return;
    const cooldownSpan = btn.querySelector('.cooldown');
    btn.disabled = true;
    let remaining = Math.ceil(cooldown / 1000);
    cooldownSpan.textContent = remaining;

    if (this.pendingCooldownTimers.has(skillIndex)) {
      clearInterval(this.pendingCooldownTimers.get(skillIndex));
    }

    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        cooldownSpan.textContent = '';
        btn.disabled = false;
        this.pendingCooldownTimers.delete(skillIndex);
        tts.speak(`Kỹ năng ${skillIndex + 1} đã sẵn sàng`);
      } else {
        cooldownSpan.textContent = remaining;
      }
    }, 1000);

    this.pendingCooldownTimers.set(skillIndex, interval);
  }

  applyOfflineAction(action) {
    if (!action?.ok) return false;
    this.syncFromState(this.gameEngine.getState());
    this.updateGameInfo();
    return true;
  }

  emitOnlineAction(type, payload = {}) {
    this.socket.emit('playerAction', { type, ...payload });
  }

  useSkill(skillIndex) {
    if (!this.myPlayer) return;
    const skill = this.myPlayer.skills[skillIndex];
    if (!skill) return;

    if (this.isOfflineMode) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'skill', skillIndex });
      if (!this.applyOfflineAction(result)) return;
    } else {
      this.emitOnlineAction('skill', { skillIndex });
    }

    this.startCooldownUI(skillIndex, skill.cooldown);
  }

  useBasicAttack() {
    if (!this.myPlayer) return;
    if (this.isOfflineMode) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'basicAttack' });
      this.applyOfflineAction(result);
    } else {
      this.emitOnlineAction('basicAttack');
    }
  }

  toggleMeditate() {
    if (!this.myPlayer) return;
    if (this.isOfflineMode) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'meditate', enabled: !this.myPlayer.isMeditating });
      this.applyOfflineAction(result);
    } else {
      this.emitOnlineAction('meditate', { enabled: !this.myPlayer.isMeditating });
    }
  }

  toggleQinggong() {
    if (!this.myPlayer) return;
    if (this.isOfflineMode) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'qinggong', enabled: !this.myPlayer.isQinggong });
      this.applyOfflineAction(result);
    } else {
      this.emitOnlineAction('qinggong', { enabled: !this.myPlayer.isQinggong });
    }
  }

  changeLane(direction) {
    if (!this.myPlayer) return;
    if (this.isOfflineMode) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'lane', direction });
      this.applyOfflineAction(result);
    } else {
      this.emitOnlineAction('lane', { direction });
    }
  }

  jump() {
    if (!this.myPlayer) return;
    if (this.isOfflineMode) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'jump' });
      this.applyOfflineAction(result);
    } else {
      this.emitOnlineAction('jump');
    }
  }

  moveLeft() {
    this.keys.left = true;
    setTimeout(() => { this.keys.left = false; }, 300);
  }

  moveRight() {
    this.keys.right = true;
    setTimeout(() => { this.keys.right = false; }, 300);
  }

  updateMovement() {
    if (!this.myPlayer) return;

    let direction = 'stop';
    if (this.keys['arrowleft'] || this.keys['left']) direction = 'left';
    if (this.keys['arrowright'] || this.keys['right']) direction = 'right';

    if (this.isOfflineMode && this.gameEngine) {
      const result = this.gameEngine.handlePlayerInput('player1', { type: 'move', direction });
      this.applyOfflineAction(result);
    } else if (!this.isOfflineMode && direction !== 'stop') {
      this.emitOnlineAction('move', { direction });
    }

    this.footstepTimer++;
    if (direction !== 'stop' && this.footstepTimer > 16) {
      audioManager.playFootstep(this.myPlayer.heroId);
      this.footstepTimer = 0;
    }
  }

  renderLanes() {
    const laneY = [355, 305, 255];
    this.ctx.strokeStyle = 'rgba(255,215,0,0.22)';
    laneY.forEach(y => {
      this.ctx.beginPath();
      this.ctx.moveTo(40, y + 42);
      this.ctx.lineTo(this.canvas.width - 40, y + 42);
      this.ctx.stroke();
    });
    return laneY;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const bg = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.55, '#1e293b');
    bg.addColorStop(1, '#3f2d1f');
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const laneY = this.renderLanes();
    this.ctx.fillStyle = '#5b4636';
    this.ctx.fillRect(0, this.ground, this.canvas.width, 110);

    if (!this.gameState) return;

    this.gameState.players.forEach(player => {
      const x = player.x;
      const y = laneY[player.laneIndex] || 305;
      const color = player.id === this.playerId ? '#22c55e' : '#f97316';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, 52, 52);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px Arial';
      this.ctx.fillText(player.id === this.playerId ? 'BẠN' : 'ĐỊCH', x - 4, y - 8);
      if (player.isMeditating) this.ctx.fillText('Điều tức', x - 4, y + 68);
      else if (player.isQinggong) this.ctx.fillText('Khinh công', x - 4, y + 68);
      else if (player.isGuarding) this.ctx.fillText('Hộ thể', x - 4, y + 68);
    });
  }

  gameOver(won) {
    if (this.isOfflineMode && this.gameEngine) this.gameEngine.stop();
    setTimeout(() => {
      if (won) {
        audioManager.playVoice(this.myPlayer.heroId, 'victory');
        tts.speak('Chiến thắng! Bạn đã thắng trận đấu', true);
        alert('Bạn thắng!');
      } else {
        audioManager.playVoice(this.myPlayer.heroId, 'defeat');
        tts.speak('Thất bại! Bạn đã thua trận đấu', true);
        alert('Bạn thua!');
      }

      if (this.isOfflineMode) this.backToLobby();
      else this.leaveRoom();
    }, 1000);
  }

  gameLoop() {
    if (!this.gameState) return;

    if (this.isOfflineMode && this.aiBot) {
      const botPlayer = this.gameEngine.players.get('bot_ai');
      const playerPlayer = this.gameEngine.players.get('player1');
      const aiAction = this.aiBot.update(botPlayer, playerPlayer);
      if (aiAction) this.gameEngine.handlePlayerInput('bot_ai', aiAction);
      if (botPlayer.hp <= 0) return this.gameOver(true);
      if (playerPlayer.hp <= 0) return this.gameOver(false);
      this.syncFromState(this.gameEngine.getState());
      this.updateGameInfo();
    }

    this.updateMovement();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }
}

const game = new Game();
game.init();
