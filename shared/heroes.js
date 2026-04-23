// Hero definitions with sound mappings
const HEROES = {
  doan_du: {
    id: 'doan_du',
    name: 'Đoàn Dự',
    title: 'Thế tử Đại Lý',
    hp: 920,
    maxChi: 180,
    chiRegen: 5,
    moveSpeed: 5,
    qinggongSpeed: 8,
    laneAffinity: 'middle',
    basicAttack: {
      id: 'basic',
      name: 'Nhất Dương Chỉ',
      damage: 32,
      cooldown: 700,
      chiCost: 0,
      range: 170,
      laneReach: 0,
      effectType: 'melee',
      ttsEffect: 'Điểm chỉ cận thân',
      audioKey: 'basic',
      sound: 'heroes/doan_du/basic.wav'
    },
    skills: [
      {
        id: 'skill1',
        name: 'Lục Mạch Thần Kiếm',
        damage: 90,
        cooldown: 2600,
        chiCost: 24,
        range: 430,
        laneReach: 1,
        effectType: 'projectile',
        movementType: 'stationary',
        ttsEffect: 'Kiếm khí xuyên thẳng phía trước',
        audioKey: 'skill1',
        sound: 'heroes/doan_du/skill1.wav',
        impactSound: 'heroes/doan_du/skill1_impact.wav'
      },
      {
        id: 'skill2',
        name: 'Lăng Ba Vi Bộ',
        damage: 0,
        cooldown: 5200,
        chiCost: 20,
        range: 0,
        laneReach: 1,
        effectType: 'movement',
        movementType: 'dash',
        dashDistance: 160,
        laneShift: 1,
        ttsEffect: 'Khinh công lướt tránh và đổi vị trí',
        audioKey: 'skill2',
        sound: 'heroes/doan_du/skill2.wav'
      },
      {
        id: 'skill3',
        name: 'Bắc Minh Thần Công',
        damage: 55,
        cooldown: 7800,
        chiCost: 18,
        range: 220,
        laneReach: 0,
        effectType: 'drain',
        movementType: 'pull',
        chiDrain: 26,
        selfHeal: 45,
        ttsEffect: 'Hấp nội lực và hồi phục bản thân',
        audioKey: 'skill3',
        sound: 'heroes/doan_du/skill3.wav',
        impactSound: 'heroes/doan_du/skill3_impact.wav'
      },
      {
        id: 'skill4',
        name: 'Vạn Kiếm Quy Tâm',
        damage: 220,
        cooldown: 16000,
        chiCost: 60,
        range: 520,
        laneReach: 2,
        effectType: 'ultimate',
        movementType: 'stationary',
        isUltimate: true,
        ttsEffect: 'Đại chiêu kiếm khí phủ kín chiến trường',
        audioKey: 'skill4',
        sound: 'heroes/doan_du/skill4.wav',
        impactSound: 'heroes/doan_du/skill4_impact.wav'
      }
    ],
    voiceLines: {
      select: 'heroes/doan_du/select.wav',
      attack: ['heroes/doan_du/attack1.wav', 'heroes/doan_du/attack2.wav'],
      hurt: ['heroes/doan_du/hurt1.wav', 'heroes/doan_du/hurt2.wav'],
      victory: 'heroes/doan_du/victory.wav',
      defeat: 'heroes/doan_du/defeat.wav'
    },
    ambientProfile: {
      footsteps: 'environment/footstep_grass.wav',
      qinggong: 'environment/qinggong_wind.wav',
      meditate: 'environment/meditate_loop.wav'
    }
  },

  quach_tinh: {
    id: 'quach_tinh',
    name: 'Quách Tĩnh',
    title: 'Bắc Hiệp',
    hp: 1120,
    maxChi: 160,
    chiRegen: 4,
    moveSpeed: 4.5,
    qinggongSpeed: 7,
    laneAffinity: 'front',
    basicAttack: {
      id: 'basic',
      name: 'Không Minh Quyền',
      damage: 36,
      cooldown: 750,
      chiCost: 0,
      range: 180,
      laneReach: 0,
      effectType: 'melee',
      ttsEffect: 'Quyền pháp trầm chắc',
      audioKey: 'basic',
      sound: 'heroes/quach_tinh/basic.wav'
    },
    skills: [
      {
        id: 'skill1',
        name: 'Hàng Long Hữu Hối',
        damage: 96,
        cooldown: 2800,
        chiCost: 22,
        range: 220,
        laneReach: 0,
        effectType: 'melee',
        movementType: 'push',
        pushDistance: 70,
        ttsEffect: 'Chưởng lực chính diện đẩy lùi đối thủ',
        audioKey: 'skill1',
        sound: 'heroes/quach_tinh/skill1.wav',
        impactSound: 'heroes/quach_tinh/skill1_impact.wav'
      },
      {
        id: 'skill2',
        name: 'Phi Long Tại Thiên',
        damage: 118,
        cooldown: 5200,
        chiCost: 28,
        range: 260,
        laneReach: 1,
        effectType: 'leap',
        movementType: 'leap',
        dashDistance: 120,
        ttsEffect: 'Phi thân áp sát bằng chưởng lực',
        audioKey: 'skill2',
        sound: 'heroes/quach_tinh/skill2.wav',
        impactSound: 'heroes/quach_tinh/skill2_impact.wav'
      },
      {
        id: 'skill3',
        name: 'Kim Chung Hộ Thể',
        damage: 0,
        cooldown: 8400,
        chiCost: 26,
        range: 0,
        laneReach: 0,
        effectType: 'guard',
        movementType: 'stance',
        guardDuration: 3200,
        damageReduction: 0.45,
        ttsEffect: 'Vận công hộ thể giảm sát thương',
        audioKey: 'skill3',
        sound: 'heroes/quach_tinh/skill3.wav'
      },
      {
        id: 'skill4',
        name: 'Kháng Long Hữu Hối',
        damage: 245,
        cooldown: 17000,
        chiCost: 62,
        range: 340,
        laneReach: 1,
        effectType: 'ultimate',
        movementType: 'slam',
        isUltimate: true,
        ttsEffect: 'Đại chiêu Hàng Long Thập Bát Chưởng bộc phát chính diện',
        audioKey: 'skill4',
        sound: 'heroes/quach_tinh/skill4.wav',
        impactSound: 'heroes/quach_tinh/skill4_impact.wav'
      }
    ],
    voiceLines: {
      select: 'heroes/quach_tinh/select.wav',
      attack: ['heroes/quach_tinh/attack1.wav', 'heroes/quach_tinh/attack2.wav'],
      hurt: ['heroes/quach_tinh/hurt1.wav', 'heroes/quach_tinh/hurt2.wav'],
      victory: 'heroes/quach_tinh/victory.wav',
      defeat: 'heroes/quach_tinh/defeat.wav'
    },
    ambientProfile: {
      footsteps: 'environment/footstep_stone.wav',
      qinggong: 'environment/qinggong_burst.wav',
      meditate: 'environment/meditate_loop.wav'
    }
  },

  truong_vo_ky: {
    id: 'truong_vo_ky',
    name: 'Trương Vô Kỵ',
    title: 'Giáo chủ Minh Giáo',
    hp: 1000,
    maxChi: 200,
    chiRegen: 6,
    moveSpeed: 5,
    qinggongSpeed: 7.5,
    laneAffinity: 'back',
    basicAttack: {
      id: 'basic',
      name: 'Thái Cực Quyền',
      damage: 34,
      cooldown: 680,
      chiCost: 0,
      range: 175,
      laneReach: 0,
      effectType: 'melee',
      ttsEffect: 'Quyền kình nhu hóa cận chiến',
      audioKey: 'basic',
      sound: 'heroes/truong_vo_ky/basic.wav'
    },
    skills: [
      {
        id: 'skill1',
        name: 'Càn Khôn Đại Na Di',
        damage: 78,
        cooldown: 3200,
        chiCost: 24,
        range: 240,
        laneReach: 1,
        effectType: 'counter',
        movementType: 'reposition',
        counterWindow: 1800,
        ttsEffect: 'Xoay chuyển kình lực và làm lệch đòn địch',
        audioKey: 'skill1',
        sound: 'heroes/truong_vo_ky/skill1.wav',
        impactSound: 'heroes/truong_vo_ky/skill1_impact.wav'
      },
      {
        id: 'skill2',
        name: 'Cửu Dương Hộ Thể',
        damage: 0,
        cooldown: 6500,
        chiCost: 20,
        range: 0,
        laneReach: 0,
        effectType: 'heal',
        movementType: 'stance',
        selfHeal: 85,
        chiRestore: 18,
        ttsEffect: 'Vận Cửu Dương hồi phục và ổn định nội lực',
        audioKey: 'skill2',
        sound: 'heroes/truong_vo_ky/skill2.wav'
      },
      {
        id: 'skill3',
        name: 'Thánh Hỏa Lệnh',
        damage: 110,
        cooldown: 7600,
        chiCost: 30,
        range: 420,
        laneReach: 2,
        effectType: 'projectile',
        movementType: 'projectile',
        ttsEffect: 'Kình lực quét chéo nhiều làn',
        audioKey: 'skill3',
        sound: 'heroes/truong_vo_ky/skill3.wav',
        impactSound: 'heroes/truong_vo_ky/skill3_impact.wav'
      },
      {
        id: 'skill4',
        name: 'Càn Khôn Thánh Diễm',
        damage: 230,
        cooldown: 16500,
        chiCost: 58,
        range: 460,
        laneReach: 2,
        effectType: 'ultimate',
        movementType: 'burst',
        isUltimate: true,
        ttsEffect: 'Đại chiêu nội kình bộc phát quét rộng nhiều làn',
        audioKey: 'skill4',
        sound: 'heroes/truong_vo_ky/skill4.wav',
        impactSound: 'heroes/truong_vo_ky/skill4_impact.wav'
      }
    ],
    voiceLines: {
      select: 'heroes/truong_vo_ky/select.wav',
      attack: ['heroes/truong_vo_ky/attack1.wav', 'heroes/truong_vo_ky/attack2.wav'],
      hurt: ['heroes/truong_vo_ky/hurt1.wav', 'heroes/truong_vo_ky/hurt2.wav'],
      victory: 'heroes/truong_vo_ky/victory.wav',
      defeat: 'heroes/truong_vo_ky/defeat.wav'
    },
    ambientProfile: {
      footsteps: 'environment/footstep_grass.wav',
      qinggong: 'environment/qinggong_wind.wav',
      meditate: 'environment/meditate_loop.wav'
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HEROES };
}
