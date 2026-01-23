import { controls } from './controls';
import { canvas } from './canvas';
import { drawImage } from './drawing';
import { assets } from './assets';
import { Units } from './units';

interface Position {
  x: number;
  y: number;
}

const SPEED = 20;

const image = assets.taxiImg;

export const state = {
  hero: {
    x: 100,
    y: 100,
  },
};

export const drawTaxi = (deltaTime: number) => {
  updateTaxiPosition(deltaTime);
  drawImage(image, state.hero.x, state.hero.y);
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

    const angleToClick = Math.atan2(y - nextPosY, x - nextPosX);

    nextPosX += Math.cos(angleToClick) * speed;
    nextPosY += Math.sin(angleToClick) * speed;
  }

  return { x: nextPosX, y: nextPosY };
};
