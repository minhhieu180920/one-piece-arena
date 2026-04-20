// Hero definitions - client-side copy
const HEROES = {
  luffy: {
    id: 'luffy',
    name: 'Luffy Gear 5',
    hp: 1000,
    skills: [
      {
        id: 'skill1',
        name: 'Gomu Gomu no Pistol',
        damage: 80,
        cooldown: 2000,
        sound: 'luffy/0001_sound.wav'
      },
      {
        id: 'skill2',
        name: 'Gomu Gomu no Gatling',
        damage: 150,
        cooldown: 5000,
        sound: 'luffy/0008_sound.wav'
      },
      {
        id: 'skill3',
        name: 'Gomu Gomu no Bazooka',
        damage: 200,
        cooldown: 8000,
        sound: 'luffy/0015_sound.wav'
      },
      {
        id: 'skill4',
        name: 'Gear 5 Ultimate',
        damage: 350,
        cooldown: 15000,
        sound: 'luffy/0019_sound.wav'
      }
    ],
    voiceLines: {
      select: 'luffy/0002_sound.wav',
      attack: ['luffy/0003_sound.wav', 'luffy/0004_sound.wav', 'luffy/0005_sound.wav'],
      hurt: ['luffy/0006_sound.wav', 'luffy/0007_sound.wav'],
      victory: 'luffy/0020_sound.wav',
      defeat: 'luffy/0018_sound.wav'
    }
  },

  zoro: {
    id: 'zoro',
    name: 'Zoro Timeskip',
    hp: 1100,
    skills: [
      {
        id: 'skill1',
        name: 'Oni Giri',
        damage: 90,
        cooldown: 2000,
        sound: 'zoro/0001_sound.wav'
      },
      {
        id: 'skill2',
        name: 'Santoryu Ogi',
        damage: 160,
        cooldown: 5000,
        sound: 'zoro/0008_sound.wav'
      },
      {
        id: 'skill3',
        name: 'Asura',
        damage: 220,
        cooldown: 8000,
        sound: 'zoro/0014_sound.wav'
      },
      {
        id: 'skill4',
        name: 'Ichidai Sanzen Daisen Sekai',
        damage: 380,
        cooldown: 15000,
        sound: 'zoro/0018_sound.wav'
      }
    ],
    voiceLines: {
      select: 'zoro/0002_sound.wav',
      attack: ['zoro/0003_sound.wav', 'zoro/0004_sound.wav', 'zoro/0005_sound.wav'],
      hurt: ['zoro/0006_sound.wav', 'zoro/0007_sound.wav'],
      victory: 'zoro/0020_sound.wav',
      defeat: 'zoro/0019_sound.wav'
    }
  },

  sanji: {
    id: 'sanji',
    name: 'Sanji Raid Suit',
    hp: 950,
    skills: [
      {
        id: 'skill1',
        name: 'Diable Jambe',
        damage: 85,
        cooldown: 2000,
        sound: 'sanji/0001_sound.wav'
      },
      {
        id: 'skill2',
        name: 'Concasse',
        damage: 155,
        cooldown: 5000,
        sound: 'sanji/0007_sound.wav'
      },
      {
        id: 'skill3',
        name: 'Hell Memories',
        damage: 210,
        cooldown: 8000,
        sound: 'sanji/0012_sound.wav'
      },
      {
        id: 'skill4',
        name: 'Ifrit Jambe',
        damage: 360,
        cooldown: 15000,
        sound: 'sanji/0018_sound.wav'
      }
    ],
    voiceLines: {
      select: 'sanji/0002_sound.wav',
      attack: ['sanji/0003_sound.wav', 'sanji/0004_sound.wav', 'sanji/0005_sound.wav'],
      hurt: ['sanji/0006_sound.wav', 'sanji/0008_sound.wav'],
      victory: 'sanji/0020_sound.wav',
      defeat: 'sanji/0019_sound.wav'
    }
  }
};
