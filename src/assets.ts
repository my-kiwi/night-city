export const assets = {
  taxiImg: new Image(),
  videoBg: document.getElementById('video') as HTMLVideoElement,
};

export const loadAssets = async () => {
  await Promise.all([
    loadVideo(assets.videoBg, './bg_light.mp4'),
    loadImage(assets.taxiImg, './taxi.png'),
  ]);
};

const loadImage = async (img: HTMLImageElement, src: string) => {
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

const loadVideo = async (video: HTMLVideoElement, src: string) => {
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = reject;
    video.src = src;
  });
};
