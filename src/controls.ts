export const controls = {
  posX: 0,
  posY: 0,
  speed: 0,
  pointer: { x: 0, y: 0, isDown: false },
  keysPressed: {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  },
};

const updateSpeed = () => {
  controls.speed = Math.max(2, Math.min(window.innerWidth, window.innerHeight) / 200);
};
window.addEventListener('resize', updateSpeed);
window.addEventListener('orientationchange', updateSpeed);
document.addEventListener('DOMContentLoaded', updateSpeed);

export const updateControls = (targetPos: { x: number; y: number }) => {
  const deltaX = targetPos.x - controls.posX;
  const deltaY = targetPos.y - controls.posY;
  controls.posX += deltaX * controls.speed;
  controls.posY += deltaY * controls.speed;
};

window.addEventListener(
  'pointerdown',
  (e) => {
    e.preventDefault();
    controls.pointer = { x: e.clientX, y: e.clientY, isDown: true };
  },
  { passive: false }
);

window.addEventListener('pointerup', (e) => {
  e.preventDefault();
  controls.pointer.isDown = false;
});

window.addEventListener(
  'pointermove',
  (e) => {
    e.preventDefault();
    if (controls.pointer.isDown) {
      controls.pointer = { x: e.clientX, y: e.clientY, isDown: true };
    }
  },
  { passive: false }
);

window.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    controls.pointer = { x: e.touches[0].clientX, y: e.touches[0].clientY, isDown: true };
  },
  { passive: false }
);

window.addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    if (controls.pointer.isDown) {
      controls.pointer = { x: e.touches[0].clientX, y: e.touches[0].clientY, isDown: true };
    }
  },
  { passive: false }
);

window.addEventListener(
  'touchend',
  (e) => {
    e.preventDefault();
    // // Handle touch end
    controls.pointer.isDown = false;
  },
  { passive: false }
);

window.addEventListener('keydown', (e) => {
  if (e.key in controls.keysPressed) {
    controls.keysPressed[e.key as keyof typeof controls.keysPressed] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key in controls.keysPressed) {
    controls.keysPressed[e.key as keyof typeof controls.keysPressed] = false;
  }
});
