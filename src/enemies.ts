import { assets } from './assets';
import { drawImage } from './drawing';
import { getHeroBounds, getHeroPosition, getHeroRadius } from './taxi';
import { canvas, ctx } from './canvas';
import { Units } from './units';

const image = assets.ennemiesImg;
const ennemiesSpriteWidth = 260;

type Enemy = {
  id: number;
  x: number;
  baseY: number;
  phase: number;
  speed: number;
  alive: boolean;
  enemyType: number;
};

type Bullet = {
  id: number;
  x: number;
  y: number;
  speed: number;
  alive: boolean;
  velocityX?: number; // optional: x velocity component (for angled shots)
  velocityY?: number; // optional: y velocity component (for angled shots)
};

type Crystal = {
  id: number;
  x: number;
  y: number;
  speed: number;
  alive: boolean;
  type: 'points' | 'invincibility' | 'powered';
};

const ENEMY_BASE_SPEED = 8;
const ENEMY_SPEED_VARIANCE = 2;
const ENEMY_SPAWN_PADDING = 80;
const WAVE_INTERVAL = 3.5;
const ENEMIES_PER_WAVE = 4;
const WAVE_AMPLITUDE = 40;
const WAVE_PERIOD = 130;
const BULLET_FIRE_INTERVAL = 0.5;
const BULLET_SPEED = 28;
const CRYSTAL_SPEED = 5;
const BULLET_RADIUS = 6;
const CRYSTAL_RADIUS = 10;
const CRYSTAL_PULSE_RATE = 1.7; // pulses per second
const CRYSTAL_PULSE_SCALE = 0.18;

const initialState = () => ({
  enemies: [] as Enemy[],
  bullets: [] as Bullet[],
  crystals: [] as Crystal[],
  lastWaveAt: performance.now() / 1000,
  lastBulletAt: 0,
  nextEnemyId: 1,
  nextBulletId: 1,
  nextCrystalId: 1,
  gameOver: false,
});

const state = initialState();

const getEnemyScale = () => {
  const maxSize = Units.value * 6;
  return Math.min(maxSize / ennemiesSpriteWidth, maxSize / image.naturalHeight);
};

const getEnemyWidth = () => ennemiesSpriteWidth * getEnemyScale();
const getEnemyHeight = () => (image.naturalHeight * getEnemyScale()) / 2.5;
const getEnemyRadius = () => Math.max(Units.value * 1.5, 16);
const getEnemyBounds = (enemy: Enemy) => {
  const width = getEnemyWidth();
  const height = getEnemyHeight();
  const enemyY = getEnemyY(enemy);

  return {
    left: enemy.x - width / 2,
    right: enemy.x + width / 2,
    top: enemyY - height / 2,
    bottom: enemyY + height / 2,
  };
};

const getBulletRadius = () => BULLET_RADIUS;
const getCrystalRadius = (time = performance.now() / 1000) => {
  const pulse = Math.sin(time * Math.PI * 2 * CRYSTAL_PULSE_RATE);
  return CRYSTAL_RADIUS * (1 + pulse * CRYSTAL_PULSE_SCALE);
};

const drawEnemyHitbox = (enemy: Enemy) => {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('debug')) {
    return;
  }
  const bounds = getEnemyBounds(enemy);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 204, 0, 0.85)';
  ctx.fillStyle = 'rgba(255, 204, 0, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bounds.left, bounds.top, width, height);
  ctx.fillRect(bounds.left, bounds.top, width, height);
  ctx.restore();
};

const spawnEnemy = (index: number): Enemy => {
  const verticalBandStart = canvas.height * 0.15;
  const verticalBandHeight = canvas.height * 0.7;
  const y = verticalBandStart + (verticalBandHeight / (ENEMIES_PER_WAVE - 1)) * index;

  return {
    id: state.nextEnemyId++,
    x: canvas.width + ENEMY_SPAWN_PADDING,
    baseY: y,
    phase: Math.random() * Math.PI * 2,
    speed: ENEMY_BASE_SPEED + Math.random() * ENEMY_SPEED_VARIANCE,
    alive: true,
    enemyType: Math.floor(Math.random() * 3), // 0, 1, or 2
  };
};

const createWave = () => {
  for (let i = 0; i < ENEMIES_PER_WAVE; i += 1) {
    state.enemies.push(spawnEnemy(i));
  }

  state.lastWaveAt = performance.now() / 1000;
};

const spawnBullet = (hasBackupGun: boolean = false) => {
  const hero = getHeroPosition();
  const mainBulletX = hero.x + getHeroRadius() + getBulletRadius();
  const mainBulletY = hero.y;

  // Main gun: straight right
  state.bullets.push({
    id: state.nextBulletId++,
    x: mainBulletX,
    y: mainBulletY,
    speed: BULLET_SPEED,
    alive: true,
  });

  // Backup guns: fire at angles when upgraded
  if (hasBackupGun) {
    const angleDown = Math.PI / 6; // 30 degrees down
    const angleUp = -Math.PI / 6; // 30 degrees up

    // Backup gun firing down-right
    state.bullets.push({
      id: state.nextBulletId++,
      x: mainBulletX,
      y: mainBulletY,
      speed: BULLET_SPEED,
      alive: true,
      velocityX: BULLET_SPEED * Math.cos(angleDown),
      velocityY: BULLET_SPEED * Math.sin(angleDown),
    });

    // Backup gun firing up-right
    state.bullets.push({
      id: state.nextBulletId++,
      x: mainBulletX,
      y: mainBulletY,
      speed: BULLET_SPEED,
      alive: true,
      velocityX: BULLET_SPEED * Math.cos(angleUp),
      velocityY: BULLET_SPEED * Math.sin(angleUp),
    });
  }

  state.lastBulletAt = performance.now() / 1000;
};

const spawnCrystal = (x: number, y: number, type: 'points' | 'invincibility' = 'points') => {
  state.crystals.push({
    id: state.nextCrystalId++,
    x,
    y,
    speed: CRYSTAL_SPEED,
    alive: true,
    type,
  });
};

const updateEnemy = (enemy: Enemy, deltaTime: number) => {
  enemy.x -= enemy.speed * deltaTime * Units.value;
};

const getEnemyY = (enemy: Enemy) =>
  enemy.baseY + Math.sin(enemy.x / WAVE_PERIOD + enemy.phase) * WAVE_AMPLITUDE;

const updateBullet = (bullet: Bullet, deltaTime: number) => {
  if (bullet.velocityX !== undefined && bullet.velocityY !== undefined) {
    bullet.x += bullet.velocityX * deltaTime * Units.value;
    bullet.y += bullet.velocityY * deltaTime * Units.value;
  } else {
    bullet.x += bullet.speed * deltaTime * Units.value;
  }
};

const updateCrystal = (crystal: Crystal, deltaTime: number) => {
  crystal.x -= crystal.speed * deltaTime * Units.value;
};

const checkHeroCollision = (enemy: Enemy) => {
  const heroBounds = getHeroBounds();
  const enemyBounds = getEnemyBounds(enemy);

  return (
    heroBounds.left < enemyBounds.right &&
    heroBounds.right > enemyBounds.left &&
    heroBounds.top < enemyBounds.bottom &&
    heroBounds.bottom > enemyBounds.top
  );
};

const checkBulletCollision = (bullet: Bullet, enemy: Enemy) => {
  const enemyY = getEnemyY(enemy);
  const distance = Math.hypot(enemy.x - bullet.x, enemyY - bullet.y);
  return distance < getBulletRadius() + getEnemyRadius();
};

const checkCrystalCollision = (crystal: Crystal) => {
  const hero = getHeroPosition();
  const distance = Math.hypot(crystal.x - hero.x, crystal.y - hero.y);
  return distance < getHeroRadius() + getCrystalRadius();
};

const cleanupEntities = () => {
  state.enemies = state.enemies.filter((enemy) => enemy.alive && enemy.x > -ENEMY_SPAWN_PADDING);
  state.bullets = state.bullets.filter(
    (bullet) => bullet.alive && bullet.x < canvas.width + ENEMY_SPAWN_PADDING
  );
  state.crystals = state.crystals.filter((crystal) => crystal.alive && crystal.x > -CRYSTAL_RADIUS);
};

const drawBullet = (bullet: Bullet) => {
  ctx.save();
  ctx.fillStyle = '#ffff6b';
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, getBulletRadius(), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawCrystal = (crystal: Crystal) => {
  const time = performance.now() / 1000;
  const radius = getCrystalRadius(time);
  const glow = 6 + radius * 0.2;
  const pulse = 0.5 + 0.5 * Math.sin(time * Math.PI * 2 * CRYSTAL_PULSE_RATE);
  const alpha = 0.65 + pulse * 0.25;

  let color: [number, number, number];
  let shadowColor: [number, number, number];

  if (crystal.type === 'invincibility') {
    color = [0, 255, 0]; // green
    shadowColor = [0, 255, 0];
  } else if (crystal.type === 'powered') {
    color = [255, 215, 0]; // gold
    shadowColor = [255, 215, 0];
  } else {
    color = [0, 130, 255]; // blue
    shadowColor = [0, 170, 255];
  }

  ctx.save();
  ctx.shadowColor = `rgba(${shadowColor[0]}, ${shadowColor[1]}, ${shadowColor[2]}, ${alpha * 0.75})`;
  ctx.shadowBlur = glow;
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  ctx.beginPath();
  ctx.moveTo(crystal.x, crystal.y - radius);
  ctx.lineTo(crystal.x + radius, crystal.y);
  ctx.lineTo(crystal.x, crystal.y + radius);
  ctx.lineTo(crystal.x - radius, crystal.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const resetEnemies = () => {
  Object.assign(state, initialState());
};

export const drawEnemies = (
  deltaTime: number,
  onCollect: (type: 'enemy' | 'points' | 'invincibility' | 'powered') => void,
  isInvincible: boolean = false,
  hasBackupGunFn?: () => boolean
) => {
  const now = performance.now() / 1000;
  const hasBackupGun = hasBackupGunFn?.() ?? false;

  if (!state.gameOver) {
    if (now - state.lastWaveAt >= WAVE_INTERVAL || state.enemies.length === 0) {
      createWave();
    }

    if (now - state.lastBulletAt >= BULLET_FIRE_INTERVAL) {
      spawnBullet(hasBackupGun);
    }

    state.bullets.forEach((bullet) => {
      if (!bullet.alive) {
        return;
      }

      updateBullet(bullet, deltaTime);
    });

    state.crystals.forEach((crystal) => {
      if (!crystal.alive) {
        return;
      }

      updateCrystal(crystal, deltaTime);
    });

    state.enemies.forEach((enemy) => {
      if (!enemy.alive) {
        return;
      }

      updateEnemy(enemy, deltaTime);

      if (checkHeroCollision(enemy)) {
        enemy.alive = false;
        if (!isInvincible) {
          state.gameOver = true;
        }
      }
    });

    state.bullets.forEach((bullet) => {
      if (!bullet.alive) {
        return;
      }

      state.enemies.forEach((enemy) => {
        if (!enemy.alive) {
          return;
        }

        if (checkBulletCollision(bullet, enemy)) {
          bullet.alive = false;
          enemy.alive = false;
          const rand = Math.random();
          let crystalType: 'points' | 'invincibility' | 'powered' = 'points';
          if (rand < 0.02) {
            crystalType = 'powered';
          } else if (rand < 0.04) {
            crystalType = 'invincibility';
          }
          spawnCrystal(enemy.x, getEnemyY(enemy), crystalType);
          onCollect('enemy');
        }
      });
    });

    state.crystals.forEach((crystal) => {
      if (crystal.alive && checkCrystalCollision(crystal)) {
        crystal.alive = false;
        onCollect(crystal.type);
      }
    });

    cleanupEntities();
  }

  state.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    drawEnemyHitbox(enemy);
    drawImage(
      image,
      enemy.x,
      getEnemyY(enemy),
      enemy.enemyType * ennemiesSpriteWidth,
      ennemiesSpriteWidth
    );
  });

  if (!state.gameOver) {
    state.bullets.forEach((bullet) => {
      if (bullet.alive) {
        drawBullet(bullet);
      }
    });
  }

  state.crystals.forEach((crystal) => {
    if (crystal.alive) {
      drawCrystal(crystal);
    }
  });

  return state.gameOver;
};
