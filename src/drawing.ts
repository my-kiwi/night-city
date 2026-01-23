import { ctx } from './canvas';
import { Units } from './units';

export const drawImage = (image: HTMLImageElement, posX: number, posY: number) => {
  const maxSize = Units.value * 6;
  const scale = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight);
  const scaledWidth = image.naturalWidth * scale;
  const scaledHeight = image.naturalHeight * scale;
  ctx.drawImage(image, posX - scaledWidth / 2, posY - scaledHeight / 2, scaledWidth, scaledHeight);
};
