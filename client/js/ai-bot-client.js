// AI Bot for single-player mode - client-side
class AIBot {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.config = {
      easy: {
        reactionTime: 1000,
        accuracy: 0.5,
        skillUsageChance: 0.3,
        moveRandomness: 0.7
      },
      medium: {
        reactionTime: 500,
        accuracy: 0.7,
        skillUsageChance: 0.5,
        moveRandomness: 0.4
      },
      hard: {
        reactionTime: 200,
        accuracy: 0.9,
        skillUsageChance: 0.7,
        moveRandomness: 0.2
      }
    };

    this.settings = this.config[difficulty];
    this.lastAction = Date.now();
    this.nextActionDelay = this.settings.reactionTime;
  }

  update(botPlayer, enemyPlayer, gameEngine) {
    const now = Date.now();

    if (now - this.lastAction < this.nextActionDelay) {
      return null;
    }

    this.lastAction = now;
    this.nextActionDelay = this.settings.reactionTime + Math.random() * 500;

    const distance = Math.abs(botPlayer.x - enemyPlayer.x);
    const action = this.decideAction(botPlayer, enemyPlayer, distance);

    return action;
  }

  decideAction(botPlayer, enemyPlayer, distance) {
    // Low HP - try to dodge
    if (botPlayer.hp < botPlayer.maxHp * 0.3) {
      if (Math.random() < 0.6) {
        return { type: 'move', direction: enemyPlayer.x > botPlayer.x ? 'left' : 'right' };
      }
    }

    // In skill range - use skill
    if (distance < 400 && Math.random() < this.settings.skillUsageChance) {
      const availableSkills = botPlayer.skills.filter(s =>
        Date.now() - s.lastUsed > s.cooldown
      );

      if (availableSkills.length > 0) {
        const skillIndex = botPlayer.skills.indexOf(
          availableSkills[Math.floor(Math.random() * availableSkills.length)]
        );

        if (Math.random() < this.settings.accuracy) {
          return { type: 'skill', skillIndex };
        }
      }
    }

    // Move towards enemy
    if (distance > 300) {
      const direction = enemyPlayer.x > botPlayer.x ? 'right' : 'left';
      return { type: 'move', direction };
    }

    // Random movement
    if (Math.random() < this.settings.moveRandomness) {
      const actions = ['left', 'right', 'jump', 'stop'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      if (randomAction === 'jump') {
        return { type: 'jump' };
      } else if (randomAction === 'stop') {
        return { type: 'move', direction: 'stop' };
      } else {
        return { type: 'move', direction: randomAction };
      }
    }

    return null;
  }
}
