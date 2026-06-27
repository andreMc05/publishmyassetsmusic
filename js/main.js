import { mountHeaderStats } from './shell/header-stats.js';
import { initTabs } from './shell/tabs.js';

document.addEventListener('DOMContentLoaded', () => {
  mountHeaderStats(document.getElementById('header-stats'));
  initTabs();
});
