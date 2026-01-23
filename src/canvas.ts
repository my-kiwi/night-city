export const canvas = document.getElementById('canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const updateCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener('resize', updateCanvasSize);
window.addEventListener('orientationchange', updateCanvasSize);
document.addEventListener('DOMContentLoaded', updateCanvasSize);
