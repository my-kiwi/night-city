import { ctx } from './canvas';
import { Units } from './units';

export const drawImage = (
  image: HTMLImageElement,
  posX: number,
  posY: number,
  sX = 0,
  sW = image.naturalWidth
) => {
  const maxSize = Units.value * 6;
  const scale = Math.min(maxSize / sW, maxSize / image.naturalHeight);
  const scaledWidth = sW * scale;
  const scaledHeight = image.naturalHeight * scale;

  ctx.drawImage(
    image,
    sX,
    0, // spritesheet is horizontal only atm
    sW,
    image.naturalHeight,
    posX - scaledWidth / 2,
    posY - scaledHeight / 2,
    scaledWidth,
    scaledHeight
  );
};
