import { STEPS } from '../constants/guide-steps.js';
import { el, externalLink } from '../utils/dom.js';

export function mountGuideTab(container) {
  container.innerHTML = '';

  const pageHeader = el('div', 'page-header');
  pageHeader.appendChild(el('h2', 'page-title', 'Registration & LLC Roadmap'));
  container.appendChild(pageHeader);

  const intro = el('p', 'guide-intro', 'Follow these phases to fully protect and monetize your music as an LLC. Complete them in order for maximum legal protection.');
  container.appendChild(intro);

  STEPS.forEach(phase => {
    const phaseEl = el('div', 'guide-phase');

    const btn = el('button', 'guide-phase__btn');
    btn.setAttribute('aria-expanded', 'false');
    const left = el('div', 'guide-phase__btn-left');
    const dot = el('div', 'phase-dot');
    dot.style.background = phase.color;
    const phaseName = el('span', '', phase.phase);
    const count = el('span', 'phase-count', `${phase.items.length} step${phase.items.length !== 1 ? 's' : ''}`);
    left.append(dot, phaseName, count);
    const chevron = el('span', 'phase-chevron', '▼');
    btn.append(left, chevron);

    const body = el('div', 'guide-phase__body');
    body.setAttribute('role', 'region');

    phase.items.forEach((item, ii) => {
      const step = el('div', 'guide-step');

      const num = el('div', 'step-num', String(ii + 1));
      num.style.background = phase.color + '22';
      num.style.border = `1px solid ${phase.color}`;
      num.style.color = phase.color;

      const content = el('div');
      const stepTitle = el('div', 'guide-step__title', item.title);
      const stepDetail = el('div', 'guide-step__detail', item.detail);
      content.append(stepTitle, stepDetail);

      if (item.links?.length) {
        const linksRow = el('div', 'guide-step__links');
        item.links.forEach(link => {
          const a = externalLink(`${link.label} ↗`, link.url, 'guide-link');
          a.style.color = phase.color;
          a.style.borderColor = phase.color + '44';
          linksRow.appendChild(a);
        });
        content.appendChild(linksRow);
      }

      step.append(num, content);
      body.appendChild(step);
    });

    btn.addEventListener('click', () => {
      const open = phaseEl.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    phaseEl.append(btn, body);
    container.appendChild(phaseEl);
  });
}
