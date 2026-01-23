import { loadAssets } from './assets';
import { startGame } from './game';

document.addEventListener('DOMContentLoaded', () => {
  loadAssets()
    .then(startGame)
    .catch((e) => {
      console.error('Error loading assets:', e);
    });
});
