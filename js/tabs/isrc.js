import { el, externalLink } from '../utils/dom.js';
import { dispatch, getState, subscribe } from '../state.js';
import { mountISRCForm } from '../components/isrc-form.js';
import { renderISRCRow } from '../components/isrc-row.js';

export function mountISRCTab(container) {
  let showForm = false;
  let editingRecord = null;
  let filterOwner = 'All';
  let searchQ = '';

  function render(s) {
    container.innerHTML = '';

    const pageHeader = el('div', 'page-header');
    pageHeader.appendChild(el('h2', 'page-title', '🔢 ISRC & UPC Registry'));
    container.appendChild(pageHeader);

    // Prefix config
    const prefixCard = el('div', 'prefix-config');
    const prefixTitle = el('div', 'prefix-config__title', '🔑 Your ISRC Registrant Prefix');
    const prefixDesc = el('p', 'prefix-config__desc');
    prefixDesc.textContent = 'The 3-character code embedded in all your self-owned ISRCs. Get this from ';
    const uLink = externalLink('USISRC.org', 'https://www.usisrc.org', '');
    uLink.style.color = 'var(--color-pink)';
    prefixDesc.appendChild(uLink);
    prefixDesc.appendChild(document.createTextNode(' under your LLC name. Once set, the Auto-Generate button uses this prefix.'));

    const prefixRow = el('div', 'flex gap-2 items-center flex-wrap');
    const prefixInp = el('input', 'prefix-input');
    prefixInp.value = s.registrantPrefix;
    prefixInp.maxLength = 3;
    prefixInp.placeholder = 'ABC';
    prefixInp.setAttribute('aria-label', 'ISRC Registrant Prefix');
    prefixInp.addEventListener('input', e => { prefixInp.value = e.target.value.toUpperCase().slice(0, 3); });

    const savePrefix = el('button', 'btn btn-sm btn-icon-pink', 'Save Prefix');
    savePrefix.addEventListener('click', () => {
      dispatch({ type: 'SET_PREFIX', prefix: prefixInp.value.toUpperCase().slice(0, 3) });
    });
    prefixRow.append(prefixInp, savePrefix);

    if (s.registrantPrefix) {
      const activeEl = el('span', 'prefix-active');
      activeEl.textContent = '✓ Active prefix: ';
      const prefixSpan = el('span', '', s.registrantPrefix);
      activeEl.appendChild(prefixSpan);
      prefixRow.appendChild(activeEl);
    }

    prefixCard.append(prefixTitle, prefixDesc, prefixRow);
    container.appendChild(prefixCard);

    // Stats
    const selfOwned = s.isrcRecords.filter(r => r.owner === 'Self-Owned').length;
    const distOwned = s.isrcRecords.filter(r => r.owner === 'Distributor-Owned').length;
    const unknown   = s.isrcRecords.filter(r => r.owner === 'Unknown').length;

    const statRow = el('div', 'stat-row');
    [
      ['Total ISRCs', s.isrcRecords.length, 'var(--color-pink)'],
      ['Self-Owned', selfOwned, 'var(--color-green)'],
      ['Distributor-Owned', distOwned, 'var(--color-red)'],
      ['Unknown', unknown, 'var(--color-muted)'],
    ].forEach(([label, val, color]) => {
      const pill = el('div', 'stat-pill');
      const v = el('div', 'stat-pill__val', String(val));
      v.style.color = color;
      const l = el('div', 'stat-pill__label', label);
      pill.append(v, l);
      statRow.appendChild(pill);
    });
    container.appendChild(statRow);

    // Form
    const formContainer = el('div');
    container.appendChild(formContainer);

    if (showForm) {
      mountISRCForm(
        formContainer,
        editingRecord,
        s.tracks,
        s.registrantPrefix,
        record => {
          dispatch({ type: editingRecord ? 'UPDATE_ISRC' : 'ADD_ISRC', record });
          showForm = false;
          editingRecord = null;
        },
        () => { showForm = false; editingRecord = null; render(getState()); }
      );
      return;
    }

    // Controls
    const filterBar = el('div', 'filter-bar');
    const chips = el('div', 'filter-chips');

    [
      { label: 'All',                activeClass: 'active-pink' },
      { label: 'Self-Owned',         activeClass: 'active-green' },
      { label: 'Distributor-Owned',  activeClass: 'active-red' },
      { label: 'Unknown',            activeClass: 'active-muted' },
    ].forEach(({ label, activeClass }) => {
      const chip = el('button', `filter-chip${filterOwner === label ? ' ' + activeClass : ''}`, label);
      chip.addEventListener('click', () => { filterOwner = label; render(getState()); });
      chips.appendChild(chip);
    });

    const rightRow = el('div', 'flex gap-2');
    const searchInp = el('input');
    searchInp.placeholder = 'Search ISRCs…';
    searchInp.value = searchQ;
    searchInp.style.maxWidth = '180px';
    searchInp.style.fontSize = 'var(--text-sm)';
    searchInp.style.padding = '6px 12px';
    searchInp.addEventListener('input', e => { searchQ = e.target.value; render(getState()); });

    const addBtn = el('button', 'btn btn-primary-pink', '+ Register ISRC');
    addBtn.addEventListener('click', () => { showForm = true; editingRecord = null; render(getState()); });
    rightRow.append(searchInp, addBtn);
    filterBar.append(chips, rightRow);
    container.appendChild(filterBar);

    // Distributor warning
    if (distOwned > 0) {
      const warn = el('div', 'alert-warn');
      warn.textContent = `⚠️ You have ${distOwned} distributor-owned ISRC${distOwned !== 1 ? 's' : ''} in your catalog. These codes are controlled by a third party. Consider re-releasing under self-owned codes and migrating your catalog.`;
      container.appendChild(warn);
    }

    // Filter records
    const q = searchQ.toLowerCase();
    const filtered = s.isrcRecords.filter(r => {
      const ownerMatch = filterOwner === 'All' || r.owner === filterOwner;
      const searchMatch = !q || r.title.toLowerCase().includes(q) || r.isrc.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q);
      return ownerMatch && searchMatch;
    });

    if (filtered.length === 0) {
      const empty = el('div', 'card-dashed');
      const icon = el('span', 'empty-icon', '🔢');
      const txt = el('p', 'empty-text',
        s.isrcRecords.length === 0
          ? 'No ISRCs registered yet. Every track and version needs its own ISRC.'
          : 'No records match your filter.'
      );
      empty.append(icon, txt);
      if (s.isrcRecords.length === 0) {
        const btn = el('button', 'btn btn-primary-pink', 'Register Your First ISRC');
        btn.addEventListener('click', () => { showForm = true; render(getState()); });
        empty.appendChild(btn);
      }
      container.appendChild(empty);
      return;
    }

    filtered.forEach(rec => {
      container.appendChild(renderISRCRow(
        rec, s.tracks,
        r => { editingRecord = r; showForm = true; render(getState()); },
        id => dispatch({ type: 'DELETE_ISRC', id })
      ));
    });
  }

  subscribe(render);
  render(getState());
}
