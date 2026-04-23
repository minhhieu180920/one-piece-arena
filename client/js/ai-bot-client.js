// AI Bot for single-player mode - client-side
class AIBot {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.config = {
      easy: {
        reactionTime: 1000,
        accuracy: 0.5,
        skillUsageChance: 0.35,
        moveRandomness: 0.7,
        meditateThreshold: 0.22
      },
      medium: {
        reactionTime: 500,
        accuracy: 0.7,
        skillUsageChance: 0.55,
        moveRandomness: 0.4,
        meditateThreshold: 0.3
      },
      hard: {
        reactionTime: 200,
        accuracy: 0.9,
        skillUsageChance: 0.75,
        moveRandomness: 0.2,
        meditateThreshold: 0.35
      }
    };

    this.settings = this.config[difficulty];
    this.lastAction = Date.now();
    this.nextActionDelay = this.settings.reactionTime;
  }

  update(botPlayer, enemyPlayer) {
    const now = Date.now();
    if (now - this.lastAction < this.nextActionDelay) {
      return null;
    }

    this.lastAction = now;
    this.nextActionDelay = this.settings.reactionTime + Math.random() * 500;
    const distance = Math.abs(botPlayer.x - enemyPlayer.x);
    return this.decideAction(botPlayer, enemyPlayer, distance);
  }

  decideAction(botPlayer, enemyPlayer, distance) {
    const chiRatio = botPlayer.chi / botPlayer.maxChi;

    if (chiRatio < this.settings.meditateThreshold && distance > 260 && !botPlayer.isMeditating) {
      return { type: 'meditate', enabled: true };
    }

    if (botPlayer.isMeditating && (chiRatio > 0.65 || distance < 220)) {
      return { type: 'meditate', enabled: false };
    }

    if (distance > 300 && chiRatio > 0.2 && Math.random() < 0.35) {
      return { type: 'qinggong', enabled: true };
    }

    if (Math.abs(botPlayer.laneIndex - enemyPlayer.laneIndex) > 0) {
      return { type: 'lane', direction: botPlayer.laneIndex < enemyPlayer.laneIndex ? 'down' : 'up' };
    }

    const availableSkills = botPlayer.skills
      .map((skill, idx) => ({ skill, idx }))
      .filter(({ skill }) => Date.now() - skill.lastUsed > skill.cooldown && botPlayer.chi >= (skill.chiCost || 0));

    if (distance < 460 && Math.random() < this.settings.skillUsageChance && availableSkills.length > 0) {
      const ultimate = availableSkills.find(({ skill }) => skill.isUltimate && chiRatio > 0.45);
      const chosen = ultimate || availableSkills[Math.floor(Math.random() * availableSkills.length)];
      if (Math.random() < this.settings.accuracy) {
        return { type: 'skill', skillIndex: chosen.idx };
      }
    }

    if (distance <= 170) {
      return { type: 'basicAttack' };
    }

    if (distance > 220) {
      const direction = enemyPlayer.x > botPlayer.x ? 'right' : 'left';
      return { type: 'move', direction };
    }

    if (Math.random() < this.settings.moveRandomness) {
      const actions = ['left', 'right', 'jump', 'stop'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      if (randomAction === 'jump') return { type: 'jump' };
      if (randomAction === 'stop') return { type: 'move', direction: 'stop' };
      return { type: 'move', direction: randomAction };
    }

    return { type: 'move', direction: 'stop' };
  }
}
