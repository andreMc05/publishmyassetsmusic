import { PLATFORMS } from '../constants/platforms.js';
import { CAT_COLORS } from '../constants/platform-meta.js';
import { el, externalLink } from '../utils/dom.js';

export function mountPlatformsTab(container) {
  let activeCat = 'All';
  let searchQ = '';

  function render() {
    container.innerHTML = '';

    const pageHeader = el('div', 'page-header');
    pageHeader.appendChild(el('h2', 'page-title', 'Promote, License & Stream'));
    container.appendChild(pageHeader);

    const intro = el('p', 'platform-intro',
      `${PLATFORMS.length} platforms across streaming, promotion, sync licensing, and live performance. Use multiple channels together for maximum reach and revenue.`
    );
    container.appendChild(intro);

    // Category filter
    const filterBar = el('div', 'cat-filter-bar');
    ['All', 'Streaming', 'Promotion', 'Licensing', 'Live'].forEach(cat => {
      const btn = el('button', `filter-chip${activeCat === cat ? ' active-pink' : ''}`, cat);
      if (activeCat === cat && cat !== 'All') {
        const c = CAT_COLORS[cat] || 'var(--color-gold)';
        btn.style.background = c + '22';
        btn.style.borderColor = c + '66';
        btn.style.color = c;
      }
      btn.addEventListener('click', () => { activeCat = cat; render(); });
      filterBar.appendChild(btn);
    });

    const searchInp = el('input', 'search-input');
    searchInp.placeholder = 'Search platforms…';
    searchInp.value = searchQ;
    searchInp.style.marginLeft = 'auto';
    searchInp.style.maxWidth = '200px';
    searchInp.style.fontSize = 'var(--text-sm)';
    searchInp.style.padding = '6px 12px';
    searchInp.addEventListener('input', e => { searchQ = e.target.value; render(); });
    filterBar.appendChild(searchInp);
    container.appendChild(filterBar);

    // Category counts
    const catStats = el('div', 'cat-stats');
    Object.entries(CAT_COLORS).forEach(([cat, color]) => {
      const count = PLATFORMS.filter(p => p.cat === cat).length;
      const cs = el('div', 'cat-stat');
      const dot = el('div', 'cat-dot');
      dot.style.background = color;
      const name = el('span', 'cat-stat__name', cat);
      const cnt = el('span', 'cat-stat__count', String(count));
      cnt.style.color = color;
      cs.append(dot, name, cnt);
      catStats.appendChild(cs);
    });
    container.appendChild(catStats);

    const q = searchQ.toLowerCase();
    const filtered = PLATFORMS.filter(p => {
      const catMatch = activeCat === 'All' || p.cat === activeCat;
      const searchMatch = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      return catMatch && searchMatch;
    });

    if (filtered.length === 0) {
      const empty = el('div', 'text-muted');
      empty.style.textAlign = 'center';
      empty.style.padding = '40px';
      empty.textContent = 'No platforms match your search.';
      container.appendChild(empty);
      return;
    }

    const grid = el('div', 'grid-auto');
    filtered.forEach(p => {
      const card = el('div', 'platform-card');
      card.style.borderTopColor = p.color;

      const head = el('div', 'platform-card__head');
      const iconBlock = el('div', 'platform-card__icon-block');
      const icon = el('span', 'platform-card__icon', p.icon);
      const nameBlock = el('div');
      const name = el('div', 'platform-card__name', p.name);
      const cat = el('span', 'platform-card__cat', p.cat);
      cat.style.color = CAT_COLORS[p.cat] || 'var(--color-muted)';
      nameBlock.append(name, cat);
      iconBlock.append(icon, nameBlock);

      const visitLink = externalLink('Visit ↗', p.url, 'platform-card__visit');
      visitLink.style.background = p.color + '22';
      visitLink.style.border = `1px solid ${p.color}55`;
      visitLink.style.color = p.color;

      head.append(iconBlock, visitLink);
      card.appendChild(head);

      const desc = el('p', 'platform-card__desc', p.desc);
      card.appendChild(desc);

      const tags = el('div', 'platform-card__tags');
      p.tags.forEach(t => tags.appendChild(el('span', 'tag', t)));
      card.appendChild(tags);

      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  render();
}
