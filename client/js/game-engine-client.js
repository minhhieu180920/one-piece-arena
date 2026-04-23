// Client-side Game Engine - All game logic runs on client
class ClientGameEngine {
  constructor() {
    this.config = {
      physics: {
        gravity: 0.8,
        jumpPower: -15,
        moveSpeed: 5,
        qinggongBoost: 2.5,
        groundY: 400,
        mapWidth: 960,
        laneCount: 3,
        laneValues: [0, 50, 100],
        laneLabels: ['tiền đạo', 'trung lộ', 'hậu tuyến'],
        laneTolerance: 1
      },
      combat: {
        defaultSkillRange: 400,
        basicAttackRange: 150,
        hitboxRadius: 50,
        meditateChiPerSecond: 22,
        passiveChiPerSecond: 4,
        qinggongDrainPerSecond: 12
      }
    };

    this.players = new Map();
    this.projectiles = [];
    this.gameLoop = null;
    this.lastUpdate = Date.now();
  }

  createPlayerState(player, initialPlayers) {
    const laneIndex = player.laneIndex ?? (player.id === initialPlayers[0].id ? 1 : 1);
    return {
      id: player.id,
      name: player.name,
      heroId: player.heroId,
      hero: player.hero,
      x: player.x || (player.id === initialPlayers[0].id ? 220 : 700),
      y: player.y || (this.config.physics.groundY - 50),
      velocityX: 0,
      velocityY: 0,
      hp: player.hero.hp,
      maxHp: player.hero.hp,
      chi: player.hero.maxChi,
      maxChi: player.hero.maxChi,
      chiRegen: player.hero.chiRegen || this.config.combat.passiveChiPerSecond,
      facing: player.id === initialPlayers[0].id ? 'right' : 'left',
      isJumping: false,
      isMeditating: false,
      isQinggong: false,
      qinggongBurstUntil: 0,
      isGuarding: false,
      guardUntil: 0,
      guardReduction: 0,
      counterUntil: 0,
      laneIndex,
      laneZ: this.config.physics.laneValues[laneIndex],
      lastBasicAttack: 0,
      lastLaneAnnounce: 0,
      skills: player.hero.skills.map(s => ({
        ...s,
        lastUsed: 0
      }))
    };
  }

  start(initialPlayers) {
    initialPlayers.forEach(player => {
      this.players.set(player.id, this.createPlayerState(player, initialPlayers));
    });

    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - this.lastUpdate;
      this.update(deltaTime);
      this.lastUpdate = now;
    }, 1000 / 60);
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  handlePlayerInput(playerId, input) {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: 'missing-player' };

    switch (input.type) {
      case 'move':
        this.handleMove(player, input.direction);
        return { ok: true };
      case 'jump':
        return this.handleJump(player);
      case 'skill':
        return this.handleSkill(player, input.skillIndex);
      case 'basicAttack':
        return this.handleBasicAttack(player);
      case 'meditate':
        return this.toggleMeditation(player, input.enabled);
      case 'qinggong':
        return this.toggleQinggong(player, input.enabled);
      case 'lane':
        return this.changeLane(player, input.direction);
      default:
        return { ok: false, reason: 'unknown-input' };
    }
  }

  getLaneLabel(laneIndex) {
    return this.config.physics.laneLabels[laneIndex] || 'trung lộ';
  }

  getRelativeDirection(attacker, target) {
    if (target.x === attacker.x) return 'ngay trước mặt';
    return target.x > attacker.x ? 'bên phải' : 'bên trái';
  }

  changeChi(player, amount) {
    player.chi = Math.max(0, Math.min(player.maxChi, player.chi + amount));
  }

  canAffectTarget(player, target, range, laneReach = 0) {
    const distance = Math.abs(player.x - target.x);
    const laneDelta = Math.abs(player.laneIndex - target.laneIndex);
    return distance <= range && laneDelta <= laneReach;
  }

  applyDamage(target, amount) {
    let damage = amount;
    if (target.isGuarding && Date.now() < target.guardUntil) {
      damage = Math.round(amount * (1 - target.guardReduction));
    }
    target.hp = Math.max(0, target.hp - damage);
    return damage;
  }

  handleMove(player, direction) {
    if (player.isMeditating) {
      player.velocityX = 0;
      return;
    }

    const speedBase = player.hero.moveSpeed || this.config.physics.moveSpeed;
    const burstActive = player.isQinggong || Date.now() < player.qinggongBurstUntil;
    const speed = burstActive ? (player.hero.qinggongSpeed || speedBase + this.config.physics.qinggongBoost) : speedBase;

    if (direction === 'left') {
      player.velocityX = -speed;
      player.facing = 'left';
      audioManager.playWalk(player.heroId);
    } else if (direction === 'right') {
      player.velocityX = speed;
      player.facing = 'right';
      audioManager.playWalk(player.heroId);
    } else {
      player.velocityX = 0;
    }
  }

  handleJump(player) {
    if (player.isMeditating) {
      return { ok: false, reason: 'meditating' };
    }

    if (!player.isJumping && player.y >= this.config.physics.groundY - 50) {
      player.velocityY = this.config.physics.jumpPower;
      player.isJumping = true;
      audioManager.playJump();
      tts.speak(player.isQinggong ? 'Khinh công bật cao' : 'Nhảy');
      return { ok: true };
    }

    return { ok: false, reason: 'already-jumping' };
  }

  toggleMeditation(player, enabled) {
    const nextState = enabled ?? !player.isMeditating;
    if (nextState === player.isMeditating) {
      return { ok: true, meditating: player.isMeditating };
    }

    player.isMeditating = nextState;
    if (nextState) {
      player.velocityX = 0;
      player.isQinggong = false;
      audioManager.playMeditate(player.heroId);
      tts.speak('Ngồi điều tức');
    } else {
      tts.speak('Kết thúc điều tức');
    }

    return { ok: true, meditating: player.isMeditating };
  }

  toggleQinggong(player, enabled) {
    const nextState = enabled ?? !player.isQinggong;
    if (nextState && player.chi < 15) {
      tts.speak('Không đủ nội lực để vận khinh công');
      return { ok: false, reason: 'insufficient-chi' };
    }

    player.isQinggong = nextState;
    if (nextState) {
      player.isMeditating = false;
      player.qinggongBurstUntil = Date.now() + 1500;
      audioManager.playQinggong(player.heroId);
      tts.speak('Vận khinh công');
    } else {
      tts.speak('Thu khinh công');
    }

    return { ok: true, qinggong: player.isQinggong };
  }

  changeLane(player, direction) {
    const delta = direction === 'up' ? -1 : 1;
    const nextLane = Math.max(0, Math.min(this.config.physics.laneCount - 1, player.laneIndex + delta));
    if (nextLane === player.laneIndex) {
      return { ok: false, reason: 'lane-limit' };
    }

    player.laneIndex = nextLane;
    player.laneZ = this.config.physics.laneValues[nextLane];
    audioManager.playLaneShift();
    tts.speak(`Chuyển sang ${this.getLaneLabel(nextLane)}`);
    return { ok: true, laneIndex: nextLane };
  }

  applySkillMovement(player, skill) {
    const direction = player.facing === 'right' ? 1 : -1;
    if ((skill.movementType === 'dash' || skill.movementType === 'leap') && skill.dashDistance) {
      player.x += skill.dashDistance * direction;
    }

    if (skill.laneShift) {
      const preferred = direction > 0 ? 1 : -1;
      const nextLane = Math.max(0, Math.min(this.config.physics.laneCount - 1, player.laneIndex + preferred));
      player.laneIndex = nextLane;
      player.laneZ = this.config.physics.laneValues[nextLane];
    }
  }

  resolveSkillOnTarget(player, target, skill) {
    let result = { hit: false, damage: 0, heal: 0, chiDrain: 0 };

    if (!this.canAffectTarget(player, target, skill.range || this.config.combat.defaultSkillRange, skill.laneReach ?? this.config.physics.laneTolerance)) {
      return result;
    }

    const directionValid = player.effectType === 'area' ||
      ((player.facing === 'right' && target.x >= player.x) || (player.facing === 'left' && target.x <= player.x));
    if (!directionValid && (skill.effectType === 'melee' || skill.effectType === 'projectile' || skill.effectType === 'ultimate')) {
      return result;
    }

    result.hit = true;

    if (skill.effectType === 'counter') {
      player.counterUntil = Date.now() + (skill.counterWindow || 1200);
      result.damage = this.applyDamage(target, skill.damage);
      return result;
    }

    if (skill.effectType === 'heal') {
      const healAmount = skill.selfHeal || 0;
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      this.changeChi(player, skill.chiRestore || 0);
      result.heal = healAmount;
      return result;
    }

    if (skill.effectType === 'guard') {
      player.isGuarding = true;
      player.guardUntil = Date.now() + (skill.guardDuration || 2500);
      player.guardReduction = skill.damageReduction || 0.35;
      return result;
    }

    if (skill.effectType === 'movement') {
      this.applySkillMovement(player, skill);
      return result;
    }

    result.damage = this.applyDamage(target, skill.damage);

    if (skill.effectType === 'drain') {
      const drain = Math.min(target.chi, skill.chiDrain || 0);
      this.changeChi(target, -drain);
      this.changeChi(player, drain);
      if (skill.selfHeal) {
        player.hp = Math.min(player.maxHp, player.hp + skill.selfHeal);
        result.heal = skill.selfHeal;
      }
      result.chiDrain = drain;
    }

    if (skill.movementType === 'push' && skill.pushDistance) {
      const pushDirection = target.x >= player.x ? 1 : -1;
      target.x += skill.pushDistance * pushDirection;
    }

    if (skill.movementType === 'pull') {
      const pullDirection = target.x >= player.x ? -1 : 1;
      target.x += 50 * pullDirection;
    }

    return result;
  }

  handleSkill(player, skillIndex) {
    const skill = player.skills[skillIndex];
    if (!skill) return { ok: false, reason: 'missing-skill' };

    const now = Date.now();
    if (now - skill.lastUsed < skill.cooldown) {
      tts.speak('Kỹ năng đang hồi');
      return { ok: false, reason: 'cooldown' };
    }

    if (player.chi < (skill.chiCost || 0)) {
      tts.speak('Không đủ nội lực');
      audioManager.playUi('no_chi');
      return { ok: false, reason: 'insufficient-chi' };
    }

    player.isMeditating = false;
    skill.lastUsed = now;
    this.changeChi(player, -(skill.chiCost || 0));
    this.applySkillMovement(player, skill);

    audioManager.playSkill(player.heroId, skillIndex);
    tts.speak(`Dùng ${skill.name}. ${skill.ttsEffect || skill.effect || ''}`.trim());

    const myPlayer = Array.from(this.players.values()).find(p => p.id === 'player1');
    if (myPlayer && player.id !== 'player1') {
      audioManager.play3D(`${player.heroId}_skill${skillIndex}`, 0.8, player.x, myPlayer.x);
    }

    const enemies = Array.from(this.players.values()).filter(p => p.id !== player.id);
    const hits = [];

    enemies.forEach(enemy => {
      const resolved = this.resolveSkillOnTarget(player, enemy, skill);
      if (!resolved.hit && !resolved.heal) return;

      if (resolved.damage > 0) {
        const direction = this.getRelativeDirection(player, enemy);
        const laneText = this.getLaneLabel(enemy.laneIndex);
        audioManager.playImpact(player.heroId, skillIndex, enemy.x, myPlayer ? myPlayer.x : player.x);
        tts.speak(`Gây ${resolved.damage} sát thương vào ${enemy.name}, ${direction}, ${laneText}. ${enemy.name} còn ${enemy.hp} máu`);
      }

      if (resolved.heal > 0) {
        audioManager.playHeal();
        tts.speak(`Hồi ${resolved.heal} sinh lực`);
      }

      if (resolved.chiDrain > 0) {
        tts.speak(`Hút ${resolved.chiDrain} nội lực`);
      }

      hits.push({
        targetId: enemy.id,
        damage: resolved.damage,
        heal: resolved.heal,
        chiDrain: resolved.chiDrain,
        targetHp: enemy.hp,
        targetChi: enemy.chi,
        laneIndex: enemy.laneIndex
      });

      if (enemy.hp <= 0) {
        this.handleGameOver(player.id);
      }
    });

    if (hits.length === 0 && skill.effectType !== 'heal' && skill.effectType !== 'guard' && skill.effectType !== 'movement') {
      audioManager.playMiss();
      tts.speak('Trượt');
    }

    return {
      ok: true,
      type: 'skill',
      skillIndex,
      chi: player.chi,
      laneIndex: player.laneIndex,
      hits,
      playerState: this.serializePlayer(player)
    };
  }

  handleBasicAttack(player) {
    const basicAttack = player.hero.basicAttack;
    if (!basicAttack) return { ok: false, reason: 'missing-basic' };

    const now = Date.now();
    if (now - (player.lastBasicAttack || 0) < basicAttack.cooldown) {
      return { ok: false, reason: 'cooldown' };
    }

    player.isMeditating = false;
    player.lastBasicAttack = now;

    const attackSounds = player.hero.voiceLines.attack;
    const randomSound = attackSounds[Math.floor(Math.random() * attackSounds.length)];
    audioManager.play(randomSound, 0.6);
    tts.speak(`${basicAttack.name}. ${basicAttack.ttsEffect || ''}`.trim());

    const enemies = Array.from(this.players.values()).filter(p => p.id !== player.id);
    const hits = [];

    enemies.forEach(enemy => {
      if (!this.canAffectTarget(player, enemy, basicAttack.range || this.config.combat.basicAttackRange, basicAttack.laneReach || 0)) {
        return;
      }

      const isFacingEnemy =
        (player.facing === 'right' && enemy.x > player.x) ||
        (player.facing === 'left' && enemy.x < player.x);

      if (!isFacingEnemy) return;

      const damage = this.applyDamage(enemy, basicAttack.damage);
      audioManager.playHit();
      tts.speak(`Gây ${damage} sát thương`);
      hits.push({ targetId: enemy.id, damage, targetHp: enemy.hp, laneIndex: enemy.laneIndex });

      if (enemy.hp <= 0) {
        this.handleGameOver(player.id);
      }
    });

    if (hits.length === 0) {
      audioManager.playMiss();
    }

    return {
      ok: true,
      type: 'basicAttack',
      hits,
      chi: player.chi,
      playerState: this.serializePlayer(player)
    };
  }

  update(deltaTime) {
    const deltaSeconds = deltaTime / 1000;

    this.players.forEach(player => {
      if (player.isGuarding && Date.now() >= player.guardUntil) {
        player.isGuarding = false;
        player.guardReduction = 0;
      }

      if (player.isQinggong) {
        this.changeChi(player, -(this.config.combat.qinggongDrainPerSecond * deltaSeconds));
        if (player.chi <= 0) {
          player.isQinggong = false;
          tts.speak('Nội lực cạn, khinh công tan');
        }
      } else {
        this.changeChi(player, player.chiRegen * deltaSeconds);
      }

      if (player.isMeditating) {
        this.changeChi(player, this.config.combat.meditateChiPerSecond * deltaSeconds);
      }

      player.velocityY += this.config.physics.gravity;
      player.x += player.velocityX;
      player.y += player.velocityY;
      player.x = Math.max(50, Math.min(this.config.physics.mapWidth - 50, player.x));

      if (player.y >= this.config.physics.groundY - 50) {
        player.y = this.config.physics.groundY - 50;
        player.velocityY = 0;
        player.isJumping = false;
      }
    });

    this.projectiles = this.projectiles.filter(proj => {
      proj.x += proj.velocityX;
      proj.y += proj.velocityY;
      return proj.x >= 0 && proj.x <= this.config.physics.mapWidth && proj.y >= 0 && proj.y <= 600;
    });
  }

  serializePlayer(player) {
    return {
      id: player.id,
      name: player.name,
      heroId: player.heroId,
      x: player.x,
      y: player.y,
      hp: player.hp,
      maxHp: player.maxHp,
      chi: Math.round(player.chi),
      maxChi: player.maxChi,
      laneIndex: player.laneIndex,
      laneZ: player.laneZ,
      facing: player.facing,
      isMeditating: player.isMeditating,
      isQinggong: player.isQinggong,
      isGuarding: player.isGuarding,
      skills: player.skills.map(s => ({
        id: s.id,
        name: s.name,
        damage: s.damage,
        cooldown: s.cooldown,
        chiCost: s.chiCost,
        isUltimate: !!s.isUltimate,
        lastUsed: s.lastUsed
      }))
    };
  }

  getState() {
    return {
      map: {
        y: 5,
        z: 50,
        laneLabels: this.config.physics.laneLabels
      },
      players: Array.from(this.players.values()).map(p => this.serializePlayer(p)),
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
