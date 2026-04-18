// Audio Manager
class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.context = null;
    this.initialized = false;
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
      'sfx/snd_00272.wav',
      'sfx/snd_00273.wav',
      'sfx/snd_00248.wav',
      'sfx/snd_00249.wav'
    ];

    const promises = menuSounds.map((path, idx) =>
      this.loadSound(`menu_${idx}`, path)
    );

    await Promise.all(promises);
  }

  async preloadGameSounds() {
    const gameSounds = [
      'sfx/snd_00000.wav', // jump
      'sfx/snd_00001.wav', // dodge
      'sfx/snd_00002.wav', // footstep
      'sfx/snd_00003.wav'  // hit
    ];

    const promises = gameSounds.map((path, idx) =>
      this.loadSound(`game_${idx}`, path)
    );

    await Promise.all(promises);
  }

  playMenuSound(type) {
    const sounds = {
      hover: 'menu_0',
      click: 'menu_1',
      select: 'menu_2',
      back: 'menu_3'
    };
    this.play(sounds[type] || 'menu_0', 0.5);
  }

  playJump() {
    this.play('game_0', 0.6);
  }

  playDodge() {
    this.play('game_1', 0.6);
  }

  playFootstep() {
    this.play('game_2', 0.3);
  }

  playHit() {
    this.play('game_3', 0.7);
  }
}

const audioManager = new AudioManager();
