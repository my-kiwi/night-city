export const assets = {
  taxiImg: new Image(),
  ennemiesImg: new Image(),
  videoBg: document.getElementById('video') as HTMLVideoElement,
};

export const loadAssets = async () => {
  await Promise.all([
    loadImage(assets.taxiImg, './taxi.png'),
    loadImage(assets.ennemiesImg, './enemies.png'),
  ]);
};

export const initVideoBackground = (src: string) => {
  const video = assets.videoBg;
  video.preload = 'metadata';
  video.defaultPlaybackRate = 2.5;
  video.src = src;
  video.load();

  const startPlayback = () => {
    video.playbackRate = 2.5;
    video.play().catch(() => {
      // autoplay may be prevented until user interaction; ignore silently
    });
  };

  const resumePlayback = () => {
    if (document.visibilityState === 'visible' && video.paused) {
      video.play().catch(() => {
        // ignore autoplay restrictions or resume failures
      });
    }
  };

  video.addEventListener('canplay', startPlayback, { once: true });
  document.addEventListener('visibilitychange', resumePlayback);
  window.addEventListener('focus', resumePlayback);
  video.addEventListener('error', () => {
    console.warn('Error loading video:', src);
  });
};

const loadImage = async (img: HTMLImageElement, src: string) => {
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Error loading image:' + src));
    img.src = src;
  });
};
