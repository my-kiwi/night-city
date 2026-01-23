export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

export const clearCanvas = (): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const updateCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener('resize', updateCanvasSize);
window.addEventListener('orientationchange', updateCanvasSize);
document.addEventListener('DOMContentLoaded', updateCanvasSize);
