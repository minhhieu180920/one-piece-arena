// Client-side Game Engine - All game logic runs on client
class ClientGameEngine {
  constructor() {
    this.config = {
      physics: {
        gravity: 0.8,
        jumpPower: -15,
        moveSpeed: 5,
        groundY: 400
      },
      combat: {
        skillRange: 400,
        hitboxRadius: 50
      }
    };

    this.players = new Map();
    this.projectiles = [];
    this.gameLoop = null;
    this.lastUpdate = Date.now();
  }

  start(initialPlayers) {
    initialPlayers.forEach(player => {
      this.players.set(player.id, {
        id: player.id,
        name: player.name,
        heroId: player.heroId,
        hero: player.hero,
        x: player.x || (player.id === initialPlayers[0].id ? 200 : 600),
        y: player.y || (this.config.physics.groundY - 50),
        velocityX: 0,
        velocityY: 0,
        hp: player.hero.hp,
        maxHp: player.hero.hp,
        facing: player.id === initialPlayers[0].id ? 'right' : 'left',
        isJumping: false,
        skills: player.hero.skills.map(s => ({
          ...s,
          lastUsed: 0
        }))
      });
    });

    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - this.lastUpdate;
      this.update(deltaTime);
      this.lastUpdate = now;
    }, 1000 / 60); // 60 FPS
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  handlePlayerInput(playerId, input) {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (input.type) {
      case 'move':
        this.handleMove(player, input.direction);
        break;
      case 'jump':
        this.handleJump(player);
        break;
      case 'skill':
        this.handleSkill(player, input.skillIndex);
        break;
      case 'basicAttack':
        this.handleBasicAttack(player);
        break;
    }
  }

  handleMove(player, direction) {
    if (direction === 'left') {
      player.velocityX = -this.config.physics.moveSpeed;
      player.facing = 'left';
      audioManager.playWalk();
    } else if (direction === 'right') {
      player.velocityX = this.config.physics.moveSpeed;
      player.facing = 'right';
      audioManager.playWalk();
    } else {
      player.velocityX = 0;
    }
  }

  handleJump(player) {
    if (!player.isJumping && player.y >= this.config.physics.groundY - 50) {
      player.velocityY = this.config.physics.jumpPower;
      player.isJumping = true;
      audioManager.playJump();
      tts.speak('Nhảy');
    }
  }

  handleSkill(player, skillIndex) {
    const skill = player.skills[skillIndex];
    if (!skill) return;

    const now = Date.now();
    if (now - skill.lastUsed < skill.cooldown) {
      tts.speak('Kỹ năng đang hồi');
      return;
    }

    skill.lastUsed = now;
    audioManager.playSkill(player.heroId, skillIndex);
    tts.speak(`Dùng ${skill.name}. ${skill.effect}`);

    // Check hit on enemies
    const enemies = Array.from(this.players.values()).filter(p => p.id !== player.id);
    let hit = false;

    enemies.forEach(enemy => {
      const distance = Math.abs(player.x - enemy.x);
      if (distance <= this.config.combat.skillRange) {
        const isFacingEnemy =
          (player.facing === 'right' && enemy.x > player.x) ||
          (player.facing === 'left' && enemy.x < player.x);

        if (isFacingEnemy) {
          hit = true;

          // Check critical hit (10% chance)
          const isCritical = Math.random() < 0.1;
          const finalDamage = isCritical ? skill.damage * 2 : skill.damage;

          enemy.hp = Math.max(0, enemy.hp - finalDamage);

          if (isCritical) {
            audioManager.playHit();
            tts.speak(`Chí mạng! Gây ${finalDamage} sát thương. ${enemy.name} còn ${enemy.hp} máu`);
          } else {
            audioManager.playHit();
            tts.speak(`Gây ${finalDamage} sát thương. ${enemy.name} còn ${enemy.hp} máu`);
          }

          if (enemy.hp <= 0) {
            this.handleGameOver(player.id);
          }
        }
      }
    });

    if (!hit) {
      audioManager.playMiss();
      tts.speak('Trượt');
    }
  }

  handleBasicAttack(player) {
    const basicAttack = player.hero.basicAttack;
    if (!basicAttack) return;

    const now = Date.now();
    if (now - (player.lastBasicAttack || 0) < basicAttack.cooldown) {
      return;
    }

    player.lastBasicAttack = now;

    // Play basic attack sound
    const attackSounds = player.hero.voiceLines.attack;
    const randomSound = attackSounds[Math.floor(Math.random() * attackSounds.length)];
    audioManager.play(randomSound, 0.6);

    tts.speak(`${basicAttack.name}`);

    // Check hit on enemies
    const enemies = Array.from(this.players.values()).filter(p => p.id !== player.id);
    let hit = false;

    enemies.forEach(enemy => {
      const distance = Math.abs(player.x - enemy.x);
      if (distance <= 150) { // Basic attack has shorter range
        const isFacingEnemy =
          (player.facing === 'right' && enemy.x > player.x) ||
          (player.facing === 'left' && enemy.x < player.x);

        if (isFacingEnemy) {
          hit = true;
          enemy.hp = Math.max(0, enemy.hp - basicAttack.damage);
          audioManager.playHit();
          tts.speak(`Gây ${basicAttack.damage} sát thương`);

          if (enemy.hp <= 0) {
            this.handleGameOver(player.id);
          }
        }
      }
    });

    if (!hit) {
      audioManager.playMiss();
    }
  }

  update(deltaTime) {
    // Update physics for all players
    this.players.forEach(player => {
      // Apply gravity
      player.velocityY += this.config.physics.gravity;

      // Update position
      player.x += player.velocityX;
      player.y += player.velocityY;

      // Boundary check
      player.x = Math.max(50, Math.min(750, player.x));

      // Ground collision
      if (player.y >= this.config.physics.groundY - 50) {
        player.y = this.config.physics.groundY - 50;
        player.velocityY = 0;
        player.isJumping = false;
      }
    });

    // Update projectiles
    this.projectiles = this.projectiles.filter(proj => {
      proj.x += proj.velocityX;
      proj.y += proj.velocityY;
      return proj.x >= 0 && proj.x <= 800 && proj.y >= 0 && proj.y <= 600;
    });
  }

  getState() {
    return {
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        heroId: p.heroId,
        x: p.x,
        y: p.y,
        hp: p.hp,
        maxHp: p.maxHp,
        facing: p.facing
      })),
      projectiles: this.projectiles
    };
  }

  handleGameOver(winnerId) {
    this.stop();
    const winner = this.players.get(winnerId);
    tts.speak(`${winner.name} chiến thắng!`, true);
    return { winnerId, winner };
  }
}
