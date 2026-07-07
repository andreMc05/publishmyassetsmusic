import { ROLES } from '../constants/catalog.js';
import { defaultAssetFolder, defaultLifecycleFields, enrichTrackLifecycle } from '../services/lifecycle.js';
import { el, uuid } from '../utils/dom.js';
import { mountLifecycleFields, createEmptyLifecycleState } from './lifecycle-form.js';
import { renderSplitBar } from './split-bar.js';

export function mountTrackForm(container, initial, onSave, onCancel) {
  container.innerHTML = '';
  let splits = initial?.splits ? structuredClone(initial.splits) : [{ id: uuid(), name: '', role: 'Artist', pct: 0 }];
  let lifecycleState = initial
    ? {
        assetFolder: { ...defaultAssetFolder(), ...initial.assetFolder },
        lifecycle: { ...defaultLifecycleFields(), ...initial.lifecycle },
      }
    : createEmptyLifecycleState();

  const card = el('div', 'card splits-form');

  // Title
  const heading = el('h3', 'splits-form__header', initial ? 'Edit Track' : 'Add New Track');
  card.appendChild(heading);

  // Grid: title + isrc
  const grid = el('div', 'grid-2');
  card.appendChild(grid);

  const titleField = el('div', 'field');
  const titleLabel = el('label', 'label', 'Track Title *');
  const titleInput = el('input');
  titleInput.placeholder = 'e.g. Midnight Drive';
  titleInput.value = initial?.title || '';
  titleInput.setAttribute('aria-label', 'Track Title');
  titleField.append(titleLabel, titleInput);

  const isrcField = el('div', 'field');
  const isrcLabel = el('label', 'label', 'ISRC (optional)');
  const isrcInput = el('input', 'input-mono');
  isrcInput.placeholder = 'e.g. USRC17607839';
  isrcInput.value = initial?.isrc || '';
  isrcInput.setAttribute('aria-label', 'ISRC code');
  isrcField.append(isrcLabel, isrcInput);
  grid.append(titleField, isrcField);

  // Splits header
  const splitsHeader = el('div', 'flex items-center justify-between gap-2');
  const splitsLabel = el('span', 'label', 'Splits');
  const btns = el('div', 'flex gap-2');
  const balanceBtn = el('button', 'btn btn-sm btn-icon-blue2', 'Auto-Balance');
  const addBtn = el('button', 'btn btn-sm btn-icon-gold', '+ Add Person');
  btns.append(balanceBtn, addBtn);
  splitsHeader.append(splitsLabel, btns);
  card.appendChild(splitsHeader);

  // Bar container
  const barWrap = el('div');
  barWrap.style.margin = '8px 0 4px';
  const totalEl = el('div', 'split-total');
  barWrap.append(document.createTextNode(''), totalEl);
  card.appendChild(barWrap);

  // Split rows container
  const rowsContainer = el('div');
  card.appendChild(rowsContainer);

  const lifecycleWrap = el('div');
  card.appendChild(lifecycleWrap);

  function renderLifecycleSection() {
    lifecycleWrap.innerHTML = '';
    mountLifecycleFields(lifecycleWrap, {
      assetFolder: lifecycleState.assetFolder,
      lifecycle: lifecycleState.lifecycle,
    }, patch => {
      lifecycleState = {
        assetFolder: { ...lifecycleState.assetFolder, ...patch.assetFolder },
        lifecycle: { ...lifecycleState.lifecycle, ...patch.lifecycle },
      };
    });
  }
  renderLifecycleSection();

  const errorEl = el('p', 'form-error hidden');
  card.appendChild(errorEl);

  const formBtns = el('div', 'flex gap-2');
  const saveBtn = el('button', 'btn btn-primary', initial ? 'Save Changes' : 'Add Track');
  const cancelBtn = el('button', 'btn btn-ghost', 'Cancel');
  formBtns.append(saveBtn, cancelBtn);
  card.appendChild(formBtns);

  container.appendChild(card);

  function refreshBar() {
    const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
    const balanced = Math.abs(total - 100) < 0.01;
    barWrap.innerHTML = '';
    barWrap.appendChild(renderSplitBar(splits));
    const tot = el('div', `split-total ${balanced ? 'ok' : 'err'}`, `${total.toFixed(2)}% / 100%`);
    tot.style.textAlign = 'right';
    tot.style.marginTop = '4px';
    barWrap.appendChild(tot);
  }

  function renderRows() {
    rowsContainer.innerHTML = '';
    splits.forEach((sp, i) => {
      const row = el('div', 'split-row');

      const nameInput = el('input');
      nameInput.placeholder = 'Name';
      nameInput.value = sp.name;
      nameInput.setAttribute('aria-label', `Split holder ${i + 1} name`);
      nameInput.addEventListener('input', e => {
        splits[i].name = e.target.value;
        refreshBar();
      });

      const roleSelect = el('select');
      roleSelect.setAttribute('aria-label', `Split holder ${i + 1} role`);
      ROLES.forEach(r => {
        const opt = el('option', '', r);
        opt.value = r;
        if (r === sp.role) opt.selected = true;
        roleSelect.appendChild(opt);
      });
      roleSelect.addEventListener('change', e => { splits[i].role = e.target.value; });

      const pctWrap = el('div', 'input-percent');
      const pctInput = el('input');
      pctInput.type = 'number';
      pctInput.min = '0';
      pctInput.max = '100';
      pctInput.step = '0.01';
      pctInput.value = sp.pct;
      pctInput.setAttribute('aria-label', `Split holder ${i + 1} percentage`);
      pctInput.addEventListener('input', e => {
        splits[i].pct = Math.max(0, Math.min(100, Number(e.target.value)));
        refreshBar();
      });
      pctWrap.appendChild(pctInput);

      const removeBtn = el('button', 'split-row__remove', '×');
      removeBtn.setAttribute('aria-label', `Remove split holder ${i + 1}`);
      removeBtn.disabled = splits.length === 1;
      removeBtn.addEventListener('click', () => {
        splits.splice(i, 1);
        renderRows();
        refreshBar();
      });

      row.append(nameInput, roleSelect, pctWrap, removeBtn);
      rowsContainer.appendChild(row);
    });
    refreshBar();
  }

  addBtn.addEventListener('click', () => {
    splits.push({ id: uuid(), name: '', role: 'Artist', pct: 0 });
    renderRows();
  });

  balanceBtn.addEventListener('click', () => {
    const even = +(100 / splits.length).toFixed(2);
    splits = splits.map((s, i) => ({
      ...s,
      pct: i === splits.length - 1 ? +(100 - even * (splits.length - 1)).toFixed(2) : even,
    }));
    renderRows();
  });

  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const total = splits.reduce((s, sp) => s + Number(sp.pct), 0);
    const balanced = Math.abs(total - 100) < 0.01;
    errorEl.classList.add('hidden');

    if (!title) { errorEl.textContent = 'Track title is required.'; errorEl.classList.remove('hidden'); return; }
    if (splits.some(s => !s.name.trim())) { errorEl.textContent = 'All split holders need a name.'; errorEl.classList.remove('hidden'); return; }
    if (!balanced) { errorEl.textContent = `Splits must add up to 100%. Currently: ${total.toFixed(2)}%`; errorEl.classList.remove('hidden'); return; }

    onSave(enrichTrackLifecycle({
      id: initial?.id || uuid(),
      title,
      isrc: isrcInput.value.trim(),
      splits: structuredClone(splits),
      createdAt: initial?.createdAt || new Date().toISOString(),
      assetFolder: lifecycleState.assetFolder,
      lifecycle: lifecycleState.lifecycle,
    }));
  });

  cancelBtn.addEventListener('click', onCancel);
  renderRows();
}
