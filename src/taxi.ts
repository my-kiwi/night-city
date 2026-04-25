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

export const drawTaxi = (deltaTime: number) => {
  updateTaxiPosition(deltaTime);
  drawImage(image, state.hero.x, state.hero.y);
  drawTaxiHitbox();
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
      return { x, y };
    }

    const angleToClick = Math.atan2(y - nextPosY, x - nextPosX);

    nextPosX += Math.cos(angleToClick) * speed;
    nextPosY += Math.sin(angleToClick) * speed;

    if (nextPosX < 0) {
      nextPosX = 0;
    }
    if (nextPosX > canvas.width) {
      nextPosX = canvas.width;
    }
    if (nextPosY < 0) {
      nextPosY = 0;
    }
    if (nextPosY > canvas.height) {
      nextPosY = canvas.height;
    }
  }

  return { x: nextPosX, y: nextPosY };
};
