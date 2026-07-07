import { el } from '../utils/dom.js';
import { dispatch, getState, subscribe } from '../state.js';
import { mountTrackerTab } from '../tabs/tracker.js';
import { mountISRCTab } from '../tabs/isrc.js';
import { mountPlatformsTab } from '../tabs/platforms.js';
import { mountGuideTab } from '../tabs/guide.js';
import { mountCatalogHealthTab } from '../tabs/catalog-health.js';

export function initTabs() {
  const tabs = [
    { id: 'tracker',   label: 'Splits Tracker',     mount: mountTrackerTab },
    { id: 'catalog',   label: 'Asset Health',       mount: mountCatalogHealthTab },
    { id: 'isrc',      label: '🔢 ISRC Registry',    mount: mountISRCTab },
    { id: 'platforms', label: 'Promote & Stream',   mount: mountPlatformsTab },
    { id: 'guide',     label: 'Registration Guide', mount: mountGuideTab },
  ];

  const tabBar = document.getElementById('tab-bar');
  const panelsContainer = document.getElementById('tab-panels');

  tabs.forEach(tab => {
    // Tab button
    const btn = el('button', `tab-btn${getState().activeTab === tab.id ? ' active' : ''}`, tab.label);
    btn.dataset.tab = tab.id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(getState().activeTab === tab.id));
    btn.addEventListener('click', () => {
      dispatch({ type: 'SET_TAB', tab: tab.id });
    });
    tabBar.appendChild(btn);

    // Panel
    const panel = el('div', `tab-panel${getState().activeTab === tab.id ? ' active' : ''}`);
    panel.id = `panel-${tab.id}`;
    panel.setAttribute('role', 'tabpanel');
    panelsContainer.appendChild(panel);

    // Static mounts (platforms & guide don't need re-renders)
    if (tab.id === 'platforms' || tab.id === 'guide') {
      tab.mount(panel);
    }
  });

  // Dynamic mounts (tracker, catalog & isrc react to state)
  mountTrackerTab(document.getElementById('panel-tracker'));
  mountCatalogHealthTab(document.getElementById('panel-catalog'));
  mountISRCTab(document.getElementById('panel-isrc'));

  // Tab switching
  subscribe(s => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const active = btn.dataset.tab === s.activeTab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${s.activeTab}`);
    });
  });
}
