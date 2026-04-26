import { controls } from './controls';
import { canvas, ctx } from './canvas';
import { drawImage } from './drawing';
import { assets } from './assets';
import { Units } from './units';

interface Position {
  x: number;
  y: number;
}

const SPEED = 15;

const image = assets.taxiImg;

const state = {
  hero: {
    x: 100,
    y: 100,
  },
  gunCount: 1,
};

export const getHeroPosition = () => ({
  x: state.hero.x,
  y: state.hero.y,
});

export const getHeroRadius = () => Math.max(Units.value * 2, 18);

const getHeroScale = () => {
  const maxSize = Units.value * 6;
  return Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight);
};

export const getHeroBounds = () => {
  const scale = getHeroScale();
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;

  return {
    left: state.hero.x - width / 2,
    right: state.hero.x + width / 2,
    top: state.hero.y - height / 2,
    bottom: state.hero.y + height / 2,
  };
};

export const resetTaxiPosition = () => {
  state.hero.x = 100;
  state.hero.y = 100;
};

export const addGun = () => {
  if (state.gunCount < 12) {
    state.gunCount++;
  }
};

export const getGunCount = () => state.gunCount;

export const resetGuns = () => {
  state.gunCount = 1;
};

export const drawTaxi = (deltaTime: number, isInvincible: boolean = false) => {
  updateTaxiPosition(deltaTime);
  drawImage(image, state.hero.x, state.hero.y);
  if (isInvincible) {
    drawInvincibilityCircle();
  }
  drawTaxiHitbox();
};

const drawInvincibilityCircle = () => {
  const time = performance.now() / 1000;
  const pulseRate = 1.7; // pulses per second, same as crystals
  const pulse = 0.5 + 0.5 * Math.sin(time * Math.PI * 2 * pulseRate);
  const baseRadius = getHeroRadius() * 1.5;
  const radius = baseRadius * (1 + pulse * 0.1); // slight radius pulse
  const alpha = 0.7 + pulse * 0.3; // pulsating alpha

  ctx.save();
  ctx.strokeStyle = `rgba(0, 255, 0, ${alpha})`;
  ctx.lineWidth = 4; // thicker for brightness
  ctx.shadowColor = `rgba(0, 255, 0, ${alpha * 0.5})`;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(state.hero.x, state.hero.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawTaxiHitbox = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('debug')) {
    return;
  }
  const bounds = getHeroBounds();
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  ctx.save();
  ctx.strokeStyle = '#ff69b4';
  ctx.fillStyle = 'rgba(255, 105, 180, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bounds.left, bounds.top, width, height);
  ctx.fillRect(bounds.left, bounds.top, width, height);
  ctx.restore();
};

const updateTaxiPosition = (deltaTime: number) => {
  const { x: nextPosX, y: nextPosY } = getNextPosition(
    { x: state.hero.x, y: state.hero.y },
    SPEED * deltaTime * Units.value // decouple speed from refresh rate
  );

  state.hero.x = nextPosX;
  state.hero.y = nextPosY;
};

const getNextPosition = (currentPos: Position, speed: number): Position => {
  let nextPosX = currentPos.x;
  let nextPosY = currentPos.y;
  // Move hero based on keyboard input
  if (controls.keysPressed.ArrowUp) {
    nextPosY -= speed;
  }
  if (controls.keysPressed.ArrowDown) {
    nextPosY += speed;
  }
  if (controls.keysPressed.ArrowLeft) {
    nextPosX -= speed;
  }
  if (controls.keysPressed.ArrowRight) {
    nextPosX += speed;
  }

  // Move hero towards pointer if pointer is down
  if (controls.pointer.isDown) {
    // move hero towards the clicked position
    // calculate real x and y based on canvas size
    const rect = canvas.getBoundingClientRect();
    const x = (controls.pointer.x - rect.left) * (canvas.clientWidth / rect.width);
    const y = (controls.pointer.y - rect.top) * (canvas.clientHeight / rect.height);

    // do not move if close enough to avoid jittering
    if (Math.hypot(x - nextPosX, y - nextPosY) < speed) {
      nextPosX = x;
      nextPosY = y;
    } else {
      const angleToClick = Math.atan2(y - nextPosY, x - nextPosX);
      nextPosX += Math.cos(angleToClick) * speed;
      nextPosY += Math.sin(angleToClick) * speed;
    }
  }

  const scale = getHeroScale();
  const halfWidth = (image.naturalWidth * scale) / 2;
  const halfHeight = (image.naturalHeight * scale) / 2;

  nextPosX = Math.min(Math.max(nextPosX, halfWidth), canvas.width - halfWidth);
  nextPosY = Math.min(Math.max(nextPosY, halfHeight), canvas.height - halfHeight);

  return { x: nextPosX, y: nextPosY };
};
