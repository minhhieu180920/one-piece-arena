// AI Bot Controller
class AIBot {
  constructor(playerId, heroId, difficulty = 'medium') {
    this.playerId = playerId;
    this.heroId = heroId;
    this.difficulty = difficulty;
    this.position = { x: 600, y: 350 };
    this.target = null;
    this.lastAction = 0;
    this.skillCooldowns = [0, 0, 0, 0];
    this.state = 'idle'; // idle, attacking, dodging, retreating

    // Difficulty settings
    this.settings = {
      easy: {
        reactionTime: 1500,
        accuracy: 0.5,
        dodgeChance: 0.2,
        skillUsageDelay: 2000,
        moveSpeed: 3
      },
      medium: {
        reactionTime: 800,
        accuracy: 0.7,
        dodgeChance: 0.4,
        skillUsageDelay: 1000,
        moveSpeed: 4
      },
      hard: {
        reactionTime: 300,
        accuracy: 0.9,
        dodgeChance: 0.7,
        skillUsageDelay: 500,
        moveSpeed: 5
      }
    };

    this.config = this.settings[difficulty];
  }

  update(gameState, enemies) {
    const now = Date.now();

    if (now - this.lastAction < this.config.reactionTime) {
      return null;
    }

    // Find closest enemy as target
    if (!this.target || !enemies.find(e => e.id === this.target.id)) {
      this.target = this.findClosestEnemy(enemies);
    }

    if (!this.target) return null;

    const action = this.decideAction(gameState, enemies);
    this.lastAction = now;

    return action;
  }

  findClosestEnemy(enemies) {
    if (enemies.length === 0) return null;

    let closest = enemies[0];
    let minDist = this.getDistance(this.position, closest.position || { x: 100, y: 350 });

    enemies.forEach(enemy => {
      const dist = this.getDistance(this.position, enemy.position || { x: 100, y: 350 });
      if (dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    });

    return closest;
  }

  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  decideAction(gameState, enemies) {
    const myPlayer = gameState.players.find(p => p.id === this.playerId);
    if (!myPlayer) return null;

    const targetPos = this.target.position || { x: 100, y: 350 };
    const distance = this.getDistance(this.position, targetPos);
    const hpPercent = myPlayer.hp / myPlayer.maxHp;

    // Low HP - retreat and dodge
    if (hpPercent < 0.3 && Math.random() < 0.6) {
      this.state = 'retreating';
      return {
        type: 'move',
        direction: this.position.x < targetPos.x ? 'left' : 'right'
      };
    }

    // Enemy too close and can dodge - dodge
    if (distance < 150 && Math.random() < this.config.dodgeChance) {
      this.state = 'dodging';
      return {
        type: 'dodge'
      };
    }

    // In attack range - use skills
    if (distance < 400) {
      const skill = this.chooseSkill(myPlayer, hpPercent);
      if (skill !== null) {
        this.state = 'attacking';
        return {
          type: 'skill',
          skillIndex: skill,
          targetId: this.target.id
        };
      }
    }

    // Move towards enemy
    this.state = 'idle';
    if (distance > 300) {
      return {
        type: 'move',
        direction: this.position.x < targetPos.x ? 'right' : 'left'
      };
    }

    // Random movement to avoid being predictable
    if (Math.random() < 0.3) {
      return {
        type: 'move',
        direction: Math.random() < 0.5 ? 'left' : 'right'
      };
    }

    return null;
  }

  chooseSkill(myPlayer, hpPercent) {
    const now = Date.now();
    const availableSkills = [];

    myPlayer.skills.forEach((skill, idx) => {
      if (now - this.skillCooldowns[idx] >= skill.cooldown) {
        availableSkills.push({ index: idx, skill });
      }
    });

    if (availableSkills.length === 0) return null;

    // Strategy based on HP
    if (hpPercent < 0.4) {
      // Low HP - use ultimate if available
      const ultimate = availableSkills.find(s => s.index === 3);
      if (ultimate && Math.random() < 0.8) {
        this.skillCooldowns[3] = now;
        return 3;
      }
    }

    // Use skills based on accuracy
    if (Math.random() > this.config.accuracy) {
      return null; // Miss intentionally based on difficulty
    }

    // Prefer higher damage skills
    availableSkills.sort((a, b) => b.skill.damage - a.skill.damage);

    // Sometimes use lower skills to be more human-like
    const skillToUse = Math.random() < 0.7 ? availableSkills[0] : availableSkills[Math.floor(Math.random() * availableSkills.length)];

    this.skillCooldowns[skillToUse.index] = now;
    return skillToUse.index;
  }

  updatePosition(newPos) {
    this.position = newPos;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIBot };
}
