// TTS Manager for Accessibility
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
    // Wait for voices to load
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
    // Prefer Vietnamese voice, fallback to English
    this.voice = voices.find(v => v.lang.startsWith('vi')) ||
                 voices.find(v => v.lang.startsWith('en')) ||
                 voices[0];
  }

  speak(text, priority = false) {
    if (!this.enabled) return;

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

// Audio Manager
class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.context = null;
    this.initialized = false;
    this.bgMusic = null;
    this.bgMusicSource = null;
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
    if (this.sounds.has(key)) return;

    try {
      const response = await fetch(`sounds/${path}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(key, audioBuffer);
    } catch (e) {
      console.error(`Failed to load sound: ${path}`, e);
    }
  }

  async preloadHeroSounds(heroId) {
    const heroes = {
      luffy: {
        skills: ['luffy/0001_sound.wav', 'luffy/0008_sound.wav', 'luffy/0015_sound.wav', 'luffy/0019_sound.wav'],
        voices: ['luffy/0002_sound.wav', 'luffy/0003_sound.wav', 'luffy/0004_sound.wav', 'luffy/0005_sound.wav',
                 'luffy/0006_sound.wav', 'luffy/0007_sound.wav', 'luffy/0020_sound.wav', 'luffy/0018_sound.wav']
      },
      zoro: {
        skills: ['zoro/0001_sound.wav', 'zoro/0008_sound.wav', 'zoro/0014_sound.wav', 'zoro/0018_sound.wav'],
        voices: ['zoro/0002_sound.wav', 'zoro/0003_sound.wav', 'zoro/0004_sound.wav', 'zoro/0005_sound.wav',
                 'zoro/0006_sound.wav', 'zoro/0007_sound.wav', 'zoro/0020_sound.wav', 'zoro/0019_sound.wav']
      },
      sanji: {
        skills: ['sanji/0001_sound.wav', 'sanji/0007_sound.wav', 'sanji/0012_sound.wav', 'sanji/0018_sound.wav'],
        voices: ['sanji/0002_sound.wav', 'sanji/0003_sound.wav', 'sanji/0004_sound.wav', 'sanji/0005_sound.wav',
                 'sanji/0006_sound.wav', 'sanji/0008_sound.wav', 'sanji/0020_sound.wav', 'sanji/0019_sound.wav']
      }
    };

    const hero = heroes[heroId];
    if (!hero) return;

    const promises = [];

    hero.skills.forEach((path, idx) => {
      promises.push(this.loadSound(`${heroId}_skill${idx}`, path));
    });

    hero.voices.forEach((path, idx) => {
      promises.push(this.loadSound(`${heroId}_voice${idx}`, path));
    });

    await Promise.all(promises);
    console.log(`Loaded sounds for ${heroId}`);
  }

  play(key, volume = 1.0) {
    if (!this.initialized || !this.sounds.has(key)) return;

    try {
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();

      source.buffer = this.sounds.get(key);
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.context.destination);

      source.start(0);
    } catch (e) {
      console.error(`Failed to play sound: ${key}`, e);
    }
  }

  playSkill(heroId, skillIndex) {
    this.play(`${heroId}_skill${skillIndex}`, 0.8);
  }

  playVoice(heroId, voiceIndex) {
    this.play(`${heroId}_voice${voiceIndex}`, 0.7);
  }

  playRandom(heroId, type) {
    const count = type === 'skill' ? 4 : 8;
    const idx = Math.floor(Math.random() * count);

    if (type === 'skill') {
      this.playSkill(heroId, idx);
    } else {
      this.playVoice(heroId, idx);
    }
  }

  async preloadMenuSounds() {
    const menuSounds = [
      'menu/move.wav',     // navigate/move
      'menu/select.wav',   // enter/confirm
      'menu/back.wav'      // back/cancel
    ];

    const promises = menuSounds.map((path, idx) =>
      this.loadSound(`menu_${idx}`, path)
    );

    await Promise.all(promises);
  }

  async preloadGameSounds() {
    const gameSounds = [
      'common/jump.wav',   // jump
      'common/walk.wav',   // walk/footstep
      'common/hit.wav',    // hit/damage
      'common/miss.wav',   // miss/dodge
      'common/heal.wav'    // heal/recover
    ];

    const promises = gameSounds.map((path, idx) =>
      this.loadSound(`game_${idx}`, path)
    );

    await Promise.all(promises);
  }

  async playMenuSound(type) {
    // Auto-init audio on first interaction
    if (!this.initialized) {
      await this.init();
      await this.preloadMenuSounds();
      await this.preloadGameSounds();
    }

    const sounds = {
      hover: 'menu_0',
      click: 'menu_1',
      select: 'menu_1',
      back: 'menu_2',
      navigate: 'menu_0',
      enter: 'menu_1',
      lobby: 'menu_1'
    };
    this.play(sounds[type] || 'menu_0', 0.5);
  }

  playJump() {
    this.play('game_0', 0.6);
  }

  playWalk() {
    this.play('game_1', 0.3);
  }

  playHit() {
    this.play('game_2', 0.7);
  }

  playMiss() {
    this.play('game_3', 0.6);
  }

  playHeal() {
    this.play('game_4', 0.7);
  }

  async loadBGMusic(type) {
    const musicFiles = {
      menu: 'menu/menu-bg.mp3',
      battle: 'common/battle-bg.mp3',
      battleStart: 'common/battle-start.mp3'
    };

    const path = musicFiles[type];
    if (!path) return;

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

  stopBGMusic() {
    if (this.bgMusicSource) {
      try {
        this.bgMusicSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.bgMusicSource = null;
    }
  }
}

const audioManager = new AudioManager();
const tts = new TTSManager();
