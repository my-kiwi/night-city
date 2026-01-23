import { canvas } from './canvas';

export const Units = {
  value: 0,
};

const updateUnits = () => {
  Units.value = Math.min(canvas.width, canvas.height) / 20;
};
window.addEventListener('resize', updateUnits);
window.addEventListener('orientationchange', updateUnits);
document.addEventListener('DOMContentLoaded', updateUnits);
