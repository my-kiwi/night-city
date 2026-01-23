import { loadAssets } from './assets';
import { startGame } from './game';

document.addEventListener('DOMContentLoaded', () => {
  loadAssets().then(startGame).catch(console.error);
});
