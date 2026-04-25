import { initVideoBackground, loadAssets } from './assets';
import { startGame } from './game';

document.addEventListener('DOMContentLoaded', () => {
  initVideoBackground('./bg_light.mp4');

  loadAssets()
    .then(startGame)
    .catch((e) => {
      console.error('Error loading assets:', e);
    });
});
