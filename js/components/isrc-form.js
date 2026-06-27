import { TRACK_VERSIONS, CODE_OWNERS } from '../constants/catalog.js';
import { el, uuid } from '../utils/dom.js';
import { validateISRC, ownerColor } from '../utils/isrc.js';

export function defaultISRCRecord() {
  return {
    id: uuid(), isrc: '', title: '', version: 'Original', artist: '',
    year: String(new Date().getFullYear()), owner: 'Self-Owned',
    registrant: '', upc: '', upcOwner: 'Self-Owned', notes: '',
    linkedTrackId: '', createdAt: new Date().toISOString(),
  };
}

export function mountISRCForm(container, initial, tracks, registrantPrefix, onSave, onCancel) {
  container.innerHTML = '';
  const rec = initial ? structuredClone(initial) : defaultISRCRecord();

  const card = el('div', 'card splits-form');
  const heading = el('h3', 'splits-form__header pink', initial ? 'Edit ISRC Record' : 'Register New ISRC');
  card.appendChild(heading);

  function field(labelText, inputEl) {
    const wrap = el('div', 'field');
    const lbl = el('label', 'label', labelText);
    wrap.append(lbl, inputEl);
    return wrap;
  }

  function makeInput(val, placeholder, cls) {
    const inp = el('input', cls || '');
    inp.value = val;
    inp.placeholder = placeholder || '';
    return inp;
  }

  function makeSelect(options, val) {
    const sel = el('select');
    options.forEach(o => {
      const opt = el('option', '', o);
      opt.value = o;
      if (o === val) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }

  // Row 1
  const grid1 = el('div', 'grid-2');
  const titleInp = makeInput(rec.title, 'e.g. Midnight Drive');
  titleInp.setAttribute('aria-label', 'Track title');
  const versionSel = makeSelect(TRACK_VERSIONS, rec.version);
  grid1.append(field('Track Title *', titleInp), field('Version', versionSel));
  card.appendChild(grid1);

  // Row 2
  const grid2 = el('div', 'grid-2');
  const artistInp = makeInput(rec.artist, 'e.g. Your LLC Name');
  const yearInp = makeInput(rec.year, '2024');
  yearInp.type = 'number';
  grid2.append(field('Artist / Rights Holder', artistInp), field('Year of Recording', yearInp));
  card.appendChild(grid2);

  // ISRC row
  const isrcField = el('div', 'field');
  const isrcLabel = el('label', 'label', 'ISRC Code');
  const isrcRow = el('div', 'input-row');
  const isrcInp = makeInput(rec.isrc, 'e.g. USABC2400001', 'input-mono');
  isrcInp.maxLength = 15;
  isrcInp.setAttribute('aria-label', 'ISRC Code');

  const autoBtn = el('button', 'btn btn-sm btn-icon-pink', '⚡ Auto-Generate');
  isrcRow.append(isrcInp, autoBtn);

  const isrcStatus = el('div');
  isrcField.append(isrcLabel, isrcRow, isrcStatus);
  card.appendChild(isrcField);

  function refreshISRCStatus() {
    const v = isrcInp.value.trim();
    isrcStatus.textContent = '';
    if (!v) return;
    if (validateISRC(v)) {
      isrcStatus.className = 'isrc-valid';
      isrcStatus.textContent = '✓ Valid ISRC format';
    } else {
      isrcStatus.className = 'isrc-invalid';
      isrcStatus.textContent = '✗ Invalid — must be 12 chars: CC + 3-char registrant + 2-digit year + 5-digit sequence';
    }
  }

  isrcInp.addEventListener('input', e => {
    isrcInp.value = e.target.value.toUpperCase();
    refreshISRCStatus();
  });

  autoBtn.addEventListener('click', () => {
    if (!registrantPrefix || registrantPrefix.length !== 3) {
      errorEl.textContent = 'Set your 3-character Registrant Prefix in the settings bar above first.';
      errorEl.classList.remove('hidden');
      return;
    }
    const year = String(new Date().getFullYear()).slice(2);
    const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
    isrcInp.value = `US${registrantPrefix.toUpperCase()}${year}${seq}`;
    ownerSel.value = 'Self-Owned';
    registrantInp.value = registrantPrefix.toUpperCase();
    refreshISRCStatus();
    errorEl.classList.add('hidden');
  });

  refreshISRCStatus();

  // Ownership + registrant
  const grid3 = el('div', 'grid-2');
  const ownerSel = makeSelect(CODE_OWNERS, rec.owner);
  ownerSel.style.color = ownerColor(rec.owner);
  ownerSel.addEventListener('change', () => { ownerSel.style.color = ownerColor(ownerSel.value); });
  const registrantInp = makeInput(rec.registrant, 'e.g. ABC', 'input-mono');
  registrantInp.maxLength = 3;
  registrantInp.addEventListener('input', e => { registrantInp.value = e.target.value.toUpperCase().slice(0, 3); });
  grid3.append(field('Code Ownership', ownerSel), field('Registrant Prefix (3 chars)', registrantInp));
  card.appendChild(grid3);

  // UPC row
  const grid4 = el('div', 'grid-2');
  const upcInp = makeInput(rec.upc, 'e.g. 012345678901', 'input-mono');
  const upcOwnerSel = makeSelect(CODE_OWNERS, rec.upcOwner);
  upcOwnerSel.style.color = ownerColor(rec.upcOwner);
  upcOwnerSel.addEventListener('change', () => { upcOwnerSel.style.color = ownerColor(upcOwnerSel.value); });
  grid4.append(field('Release UPC (if assigned)', upcInp), field('UPC Ownership', upcOwnerSel));
  card.appendChild(grid4);

  // Linked track
  const linkSel = makeSelect([], rec.linkedTrackId);
  const defaultOpt = el('option', '', '— Not linked —');
  defaultOpt.value = '';
  linkSel.prepend(defaultOpt);
  tracks.forEach(t => {
    const opt = el('option', '', t.title);
    opt.value = t.id;
    if (t.id === rec.linkedTrackId) opt.selected = true;
    linkSel.appendChild(opt);
  });
  card.appendChild(field('Link to Splits Track (optional)', linkSel));

  // Notes
  const notesInp = makeInput(rec.notes, 'e.g. Use this ISRC when adding to album — do not reassign');
  card.appendChild(field('Notes', notesInp));

  const errorEl = el('p', 'form-error hidden');
  card.appendChild(errorEl);

  const formBtns = el('div', 'flex gap-2');
  const saveBtn = el('button', 'btn btn-primary-pink', initial ? 'Save Changes' : 'Register ISRC');
  const cancelBtn = el('button', 'btn btn-ghost', 'Cancel');
  formBtns.append(saveBtn, cancelBtn);
  card.appendChild(formBtns);

  saveBtn.addEventListener('click', () => {
    const title = titleInp.value.trim();
    const isrc = isrcInp.value.trim().replace(/-/g, '').toUpperCase();
    errorEl.classList.add('hidden');
    if (!title) { errorEl.textContent = 'Track title is required.'; errorEl.classList.remove('hidden'); return; }
    if (isrc && !validateISRC(isrc)) { errorEl.textContent = 'ISRC format invalid. Expected: CC-XXX-YY-NNNNN (12 chars).'; errorEl.classList.remove('hidden'); return; }
    onSave({
      id: rec.id, isrc, title,
      version: versionSel.value,
      artist: artistInp.value.trim(),
      year: yearInp.value.trim(),
      owner: ownerSel.value,
      registrant: registrantInp.value.trim(),
      upc: upcInp.value.trim(),
      upcOwner: upcOwnerSel.value,
      linkedTrackId: linkSel.value,
      notes: notesInp.value.trim(),
      createdAt: rec.createdAt,
    });
  });

  cancelBtn.addEventListener('click', onCancel);
  container.appendChild(card);
}
