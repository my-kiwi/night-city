import { ctx, canvas } from './canvas';
import { assets } from './assets';

const { taxiImg } = assets;

// proportionally scaled to canvas size
let UNIT: number;

const updateUnits = () => {
  UNIT = Math.min(canvas.width, canvas.height) / 20;
};
window.addEventListener('resize', updateUnits);
window.addEventListener('orientationchange', updateUnits);
document.addEventListener('DOMContentLoaded', updateUnits);

export const drawTaxi = () => {
  const maxSize = UNIT * 6;
  const scale = Math.min(maxSize / taxiImg.naturalWidth, maxSize / taxiImg.naturalHeight);
  const scaledWidth = taxiImg.naturalWidth * scale;
  const scaledHeight = taxiImg.naturalHeight * scale;
  const posX = UNIT * 7 + (maxSize - scaledWidth) / 2;
  const posY = UNIT * 12 + (maxSize - scaledHeight) / 2;
  ctx.drawImage(taxiImg, posX, posY, scaledWidth, scaledHeight);
};
