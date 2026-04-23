// Custom sound mapping for heroes
const CUSTOM_SOUND_MAP = {
  doan_du: {
    basicAttack: ["剑丢下.mp3", "砍头.mp3"],
    skill1: ["击打声1.wav", "拳法左1.wav"],
    skill2: ["拔刀多人.mp3", "乱箭发射.mp3"],
    skill3: ["治疗左1.wav", "治疗右1.wav"],
    skill4: ["银龙剑诀.wav", "光魔法攻击左1.wav"],
    select: ["提示1.WAV", "提示2.wav"],
    attack: ["击打声1.wav", "拳法左1.wav"],
    hurt: ["摔倒1.wav", "摔倒在沙地上.wav"],
    victory: ["战斗胜利.wav"],
    defeat: ["战斗失败.wav"],
    ambientFootsteps: ["脚步沙地.wav", "脚步树林.wav"],
    ambientQinggong: ["qinggong_wind.wav"],
    ambientMeditate: ["meditate_loop.wav"]
  },
  quach_tinh: {
    basicAttack: ["剑丢下.mp3"],
    skill1: ["七星拳.wav"],
    skill2: ["拔刀多人.mp3"],
    skill3: ["治疗右1.wav"],
    skill4: ["银龙剑诀.wav"],
    select: ["提示2.wav"],
    attack: ["击打声1.wav"],
    hurt: ["摔倒1.wav"],
    victory: ["战斗胜利.wav"],
    defeat: ["战斗失败.wav"],
    ambientFootsteps: ["脚步石头.wav"],
    ambientQinggong: ["qinggong_wind.wav"],
    ambientMeditate: ["meditate_loop.wav"]
  },
  truong_vo_ky: {
    basicAttack: ["剑丢下.mp3"],
    skill1: ["拳法左1.wav"],
    skill2: ["治疗左1.wav"],
    skill3: ["光魔法攻击左1.wav"],
    skill4: ["银龙剑诀.wav"],
    select: ["提示3.wav"],
    attack: ["击打声1.wav"],
    hurt: ["摔倒1.wav"],
    victory: ["战斗胜利.wav"],
    defeat: ["战斗失败.wav"],
    ambientFootsteps: ["脚步树林.wav"],
    ambientQinggong: ["qinggong_wind.wav"],
    ambientMeditate: ["meditate_loop.wav"]
  }
};

// Deterministic sound mapping for heroes – always play the first entry for each key
AudioManager.prototype.playFixed = function(heroId, key, volume = 1.0, pan = 0, loop = false) {
  const list = CUSTOM_SOUND_MAP[heroId] && CUSTOM_SOUND_MAP[heroId][key];
  if (!list || list.length === 0) return null;
  const chosen = list[0]; // always the first defined sound
  return this.play(chosen, volume, pan, loop);
};

class TTSManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.enabled = true;
    this.queue = [];
    this.speaking = false;
    this.init();
  }

  init() {
    if (this.synth.getVoices().length > 0) {
      this.selectVoice();
    } else {
      this.synth.addEventListener('voiceschanged', () => {
        this.selectVoice();
      });
    }
  }

  selectVoice() {
    const voices = this.synth.getVoices();
    this.voice = voices.find(v => v.lang.startsWith('vi')) ||
                 voices.find(v => v.lang.startsWith('en')) ||
                 voices[0];
  }

  speak(text, priority = false) {
    if (!this.enabled || !text) return;

    if (priority) {
      this.synth.cancel();
      this.queue = [];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      this.speaking = false;
      this.processQueue();
    };

    if (this.speaking) {
      this.queue.push(utterance);
    } else {
      this.speaking = true;
      this.synth.speak(utterance);
    }
  }

  processQueue() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.speaking = true;
      this.synth.speak(next);
    }
  }

  stop() {
    this.synth.cancel();
    this.queue = [];
    this.speaking = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }
}

class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.context = null;
    this.initialized = false;
    this.bgMusic = null;
    this.bgMusicSource = null;
    this.ambientSource = null;
  }

  async init() {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('Audio system initialized');
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  }

  async loadSound(key, path) {
    if (!this.initialized || this.sounds.has(key)) return;

    try {
      const response = await fetch(`sounds/${path}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(key, audioBuffer);
    } catch (e) {
      console.error(`Failed to load sound: ${path}`, e);
    }
  }

  buildHeroSoundMap(heroId) {
    const hero = HEROES[heroId];
    if (!hero) return [];

    const sounds = [];
    sounds.push([`${heroId}_basic`, hero.basicAttack.sound]);
    hero.skills.forEach((skill, idx) => {
      sounds.push([`${heroId}_skill${idx}`, skill.sound]);
      if (skill.impactSound) {
        sounds.push([`${heroId}_skill${idx}_impact`, skill.impactSound]);
      }
    });

    sounds.push([`${heroId}_voice_select`, hero.voiceLines.select]);
    hero.voiceLines.attack.forEach((path, idx) => sounds.push([`${heroId}_voice_attack${idx}`, path]));
    hero.voiceLines.hurt.forEach((path, idx) => sounds.push([`${heroId}_voice_hurt${idx}`, path]));
    sounds.push([`${heroId}_voice_victory`, hero.voiceLines.victory]);
    sounds.push([`${heroId}_voice_defeat`, hero.voiceLines.defeat]);
    sounds.push([`${heroId}_ambient_footsteps`, hero.ambientProfile.footsteps]);
    sounds.push([`${heroId}_ambient_qinggong`, hero.ambientProfile.qinggong]);
    sounds.push([`${heroId}_ambient_meditate`, hero.ambientProfile.meditate]);

    return sounds;
  }

  async preloadHeroSounds(heroId) {
    const heroSounds = this.buildHeroSoundMap(heroId);
    await Promise.all(heroSounds.map(([key, path]) => this.loadSound(key, path)));
  }

  async preloadMenuSounds() {
    const menuSounds = [
      ['menu_move', 'menu/move.wav'],
      ['menu_select', 'menu/select.wav'],
      ['menu_back', 'menu/back.wav'],
      ['ui_no_chi', 'ui/no-chi.wav'],
      ['ui_lane', 'ui/lane-shift.wav']
    ];

    await Promise.all(menuSounds.map(([key, path]) => this.loadSound(key, path)));
  }

  async preloadGameSounds() {
    const gameSounds = [
      ['game_jump', 'common/jump.wav'],
      ['game_walk', 'common/walk.wav'],
      ['game_hit', 'common/hit.wav'],
      ['game_miss', 'common/miss.wav'],
      ['game_heal', 'common/heal.wav'],
      ['game_dodge', 'common/dodge.wav'],
      ['environment_footstep_grass', 'environment/footstep_grass.wav'],
      ['environment_footstep_stone', 'environment/footstep_stone.wav'],
      ['environment_qinggong_wind', 'environment/qinggong_wind.wav'],
      ['environment_qinggong_burst', 'environment/qinggong_burst.wav'],
      ['environment_meditate_loop', 'environment/meditate_loop.wav'],
      ['environment_birds', 'environment/birds_loop.wav'],
      ['environment_wind', 'environment/wind_loop.wav']
    ];

    await Promise.all(gameSounds.map(([key, path]) => this.loadSound(key, path)));
  }

  play(key, volume = 1.0, panValue = 0, loop = false) {
    if (!this.initialized || !this.sounds.has(key)) return null;

    try {
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      const pannerNode = this.context.createStereoPanner();

      source.buffer = this.sounds.get(key);
      source.loop = loop;
      gainNode.gain.value = volume;
      pannerNode.pan.value = panValue;

      source.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(this.context.destination);
      source.start(0);
      return source;
    } catch (e) {
      console.error(`Failed to play sound: ${key}`, e);
      return null;
    }
  }

  play3D(key, volume = 1.0, x, myX) {
    const distance = x - myX;
    const maxDistance = 500;
    let pan = distance / maxDistance;
    pan = Math.max(-1, Math.min(1, pan));
    const distanceAbs = Math.abs(distance);
    const volumeMultiplier = Math.max(0.2, 1 - (distanceAbs / maxDistance));
    this.play(key, volume * volumeMultiplier, pan);
  }

  playSkill(heroId, skillIndex) {
    this.play(`${heroId}_skill${skillIndex}`, 0.85);
  }

  playImpact(heroId, skillIndex, x, myX) {
    const key = `${heroId}_skill${skillIndex}_impact`;
    if (this.sounds.has(key)) {
      this.play3D(key, 0.8, x, myX);
    } else {
      this.playHit();
    }
  }

  playVoice(heroId, type, index = 0) {
    const key = type === 'select'
      ? `${heroId}_voice_select`
      : type === 'victory'
        ? `${heroId}_voice_victory`
        : type === 'defeat'
          ? `${heroId}_voice_defeat`
          : `${heroId}_voice_${type}${index}`;
    this.play(key, 0.7);
  }

  playMenuSound(type) {
    const sounds = {
      hover: 'menu_move',
      click: 'menu_select',
      select: 'menu_select',
      back: 'menu_back',
      navigate: 'menu_move',
      enter: 'menu_select',
      lobby: 'menu_select'
    };
    this.play(sounds[type] || 'menu_move', 0.5);
  }

  playJump() {
    this.play('game_jump', 0.6);
  }

  playWalk(heroId = null) {
    const key = heroId ? `${heroId}_ambient_footsteps` : 'game_walk';
    this.play(this.sounds.has(key) ? key : 'game_walk', 0.25);
  }

  playFootstep(heroId = null) {
    this.playWalk(heroId);
  }

  playHit() {
    this.play('game_hit', 0.7);
  }

  playMiss() {
    this.play('game_miss', 0.6);
  }

  playHeal() {
    this.play('game_heal', 0.7);
  }

  playDodge() {
    this.play('game_dodge', 0.6);
  }

  playQinggong(heroId = null) {
    const key = heroId ? `${heroId}_ambient_qinggong` : 'environment_qinggong_wind';
    this.play(this.sounds.has(key) ? key : 'environment_qinggong_wind', 0.6);
  }

  playMeditate(heroId = null) {
    const key = heroId ? `${heroId}_ambient_meditate` : 'environment_meditate_loop';
    this.play(this.sounds.has(key) ? key : 'environment_meditate_loop', 0.5);
  }

  playLaneShift() {
    this.play('ui_lane', 0.5);
  }

  playUi(type) {
    if (type === 'no_chi') {
      this.play('ui_no_chi', 0.55);
    }
  }

  async loadBGMusic(type) {
    const musicFiles = {
      menu: 'menu/menu-bg.mp3',
      battle: 'common/battle-bg.mp3',
      battleStart: 'common/battle-start.mp3'
    };

    const path = musicFiles[type];
    if (!path || !this.initialized) return;

    try {
      const response = await fetch(`sounds/${path}`);
      const arrayBuffer = await response.arrayBuffer();
      this.bgMusic = await this.context.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error(`Failed to load BG music: ${path}`, e);
    }
  }

  playBGMusic(type, loop = true, volume = 0.3) {
    this.stopBGMusic();

    this.loadBGMusic(type).then(() => {
      if (!this.bgMusic || !this.initialized) return;

      this.bgMusicSource = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      this.bgMusicSource.buffer = this.bgMusic;
      this.bgMusicSource.loop = loop;
      gainNode.gain.value = volume;
      this.bgMusicSource.connect(gainNode);
      gainNode.connect(this.context.destination);
      this.bgMusicSource.start(0);
    });
  }

  playAmbientBattle() {
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch (e) {}
    }
    const first = this.play('environment_birds', 0.18, -0.3, true);
    const second = this.play('environment_wind', 0.14, 0.35, true);
    this.ambientSource = second || first;
  }

  stopBGMusic() {
    if (this.bgMusicSource) {
      try {
        this.bgMusicSource.stop();
      } catch (e) {}
      this.bgMusicSource = null;
    }
  }
}

const audioManager = new AudioManager();
const tts = new TTSManager();
