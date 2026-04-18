import { assets } from './assets';
import { drawImage } from './drawing';
import { getHeroPosition } from './taxi';
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
};

type Bullet = {
  id: number;
  x: number;
  y: number;
  speed: number;
  alive: boolean;
};

const ENEMY_BASE_SPEED = 8;
const ENEMY_SPEED_VARIANCE = 2;
const ENEMY_SPAWN_PADDING = 80;
const WAVE_INTERVAL = 3.5;
const ENEMIES_PER_WAVE = 4;
const WAVE_AMPLITUDE = 40;
const WAVE_PERIOD = 130;
const BULLET_FIRE_INTERVAL = 0.28;
const BULLET_SPEED = 28;
const BULLET_RADIUS = 6;

const state = {
  enemies: [] as Enemy[],
  bullets: [] as Bullet[],
  lastWaveAt: performance.now() / 1000,
  lastBulletAt: 0,
  nextEnemyId: 1,
  nextBulletId: 1,
  gameOver: false,
};

const getEnemyRadius = () => Math.max(Units.value * 2.5, 16);
const getHeroRadius = () => Math.max(Units.value * 3, 18);
const getBulletRadius = () => BULLET_RADIUS;

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
  };
};

const createWave = () => {
  for (let i = 0; i < ENEMIES_PER_WAVE; i += 1) {
    state.enemies.push(spawnEnemy(i));
  }

  state.lastWaveAt = performance.now() / 1000;
};

const spawnBullet = () => {
  const hero = getHeroPosition();

  state.bullets.push({
    id: state.nextBulletId++,
    x: hero.x + getHeroRadius() + getBulletRadius(),
    y: hero.y,
    speed: BULLET_SPEED,
    alive: true,
  });
  state.lastBulletAt = performance.now() / 1000;
};

const updateEnemy = (enemy: Enemy, deltaTime: number) => {
  enemy.x -= enemy.speed * deltaTime * Units.value;
};

const getEnemyY = (enemy: Enemy) =>
  enemy.baseY + Math.sin((enemy.x / WAVE_PERIOD) + enemy.phase) * WAVE_AMPLITUDE;

const updateBullet = (bullet: Bullet, deltaTime: number) => {
  bullet.x += bullet.speed * deltaTime * Units.value;
};

const checkHeroCollision = (enemy: Enemy) => {
  const hero = getHeroPosition();
  const enemyY = getEnemyY(enemy);
  const distance = Math.hypot(enemy.x - hero.x, enemyY - hero.y);
  return distance < getHeroRadius() + getEnemyRadius();
};

const checkBulletCollision = (bullet: Bullet, enemy: Enemy) => {
  const enemyY = getEnemyY(enemy);
  const distance = Math.hypot(enemy.x - bullet.x, enemyY - bullet.y);
  return distance < getBulletRadius() + getEnemyRadius();
};

const cleanupEntities = () => {
  state.enemies = state.enemies.filter((enemy) => enemy.alive && enemy.x > -ENEMY_SPAWN_PADDING);
  state.bullets = state.bullets.filter((bullet) => bullet.alive && bullet.x < canvas.width + ENEMY_SPAWN_PADDING);
};

const drawBullet = (bullet: Bullet) => {
  ctx.save();
  ctx.fillStyle = '#ffff6b';
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, getBulletRadius(), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawEnemies = (deltaTime: number) => {
  const now = performance.now() / 1000;

  if (!state.gameOver) {
    if (now - state.lastWaveAt >= WAVE_INTERVAL || state.enemies.length === 0) {
      createWave();
    }

    if (now - state.lastBulletAt >= BULLET_FIRE_INTERVAL) {
      spawnBullet();
    }

    state.bullets.forEach((bullet) => {
      if (!bullet.alive) {
        return;
      }

      updateBullet(bullet, deltaTime);
    });

    state.enemies.forEach((enemy) => {
      if (!enemy.alive) {
        return;
      }

      updateEnemy(enemy, deltaTime);

      if (checkHeroCollision(enemy)) {
        enemy.alive = false;
        state.gameOver = true;
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
        }
      });
    });

    cleanupEntities();
  }

  state.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }

    drawImage(image, enemy.x, getEnemyY(enemy), 0, ennemiesSpriteWidth);
  });

  if (!state.gameOver) {
    state.bullets.forEach((bullet) => {
      if (bullet.alive) {
        drawBullet(bullet);
      }
    });
  }

  return state.gameOver;
};
