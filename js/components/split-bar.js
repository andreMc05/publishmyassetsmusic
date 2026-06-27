import { SPLIT_COLORS } from '../constants/catalog.js';
import { el } from '../utils/dom.js';

export function renderSplitBar(splits) {
  const bar = el('div', 'split-bar');
  const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
  splits.forEach((sp, i) => {
    const seg = el('div', 'split-bar__segment');
    seg.style.width = `${total > 0 ? (sp.pct / total) * 100 : 0}%`;
    seg.style.background = SPLIT_COLORS[i % SPLIT_COLORS.length];
    seg.title = `${sp.name}: ${sp.pct}%`;
    bar.appendChild(seg);
  });
  return bar;
}
