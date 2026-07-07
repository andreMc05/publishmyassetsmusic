import { RECOUPMENT_STATUSES, RECOUPMENT_LABELS } from '../constants/lifecycle.js';
import { defaultAssetFolder, defaultLifecycleFields } from '../services/lifecycle.js';
import { el } from '../utils/dom.js';

export function mountLifecycleFields(container, track, onChange) {
  container.innerHTML = '';
  const assetFolder = track?.assetFolder ?? {};
  const lifecycle = track?.lifecycle ?? {};

  const section = el('div', 'lifecycle-form');

  const heading = el('h4', 'lifecycle-form__heading', 'Catalog Architecture & Asset Health');
  section.appendChild(heading);

  // Release date + recoupment
  const grid = el('div', 'grid-2');
  section.appendChild(grid);

  const releaseField = el('div', 'field');
  const releaseLabel = el('label', 'label', 'Release Date');
  const releaseInput = el('input');
  releaseInput.type = 'date';
  if (lifecycle.release_date) {
    releaseInput.value = lifecycle.release_date.slice(0, 10);
  }
  releaseInput.addEventListener('change', () => {
    onChange({
      lifecycle: {
        release_date: releaseInput.value ? new Date(releaseInput.value).toISOString() : null,
      },
    });
  });
  releaseField.append(releaseLabel, releaseInput);

  const recoupField = el('div', 'field');
  const recoupLabel = el('label', 'label', 'Recoupment Status');
  const recoupSelect = el('select');
  RECOUPMENT_STATUSES.forEach(status => {
    const opt = el('option', '', RECOUPMENT_LABELS[status]);
    opt.value = status;
    if (status === (lifecycle.recoupment_status ?? 'UNRECOUPED_DEBT_BLACK_HOLE')) opt.selected = true;
    recoupSelect.appendChild(opt);
  });
  recoupSelect.addEventListener('change', () => {
    onChange({ lifecycle: { recoupment_status: recoupSelect.value } });
  });
  recoupField.append(recoupLabel, recoupSelect);
  grid.append(releaseField, recoupField);

  const balanceField = el('div', 'field');
  const balanceLabel = el('label', 'label', 'Unrecouped Balance ($)');
  const balanceInput = el('input');
  balanceInput.type = 'number';
  balanceInput.min = '0';
  balanceInput.step = '0.01';
  balanceInput.value = lifecycle.unrecouped_balance ?? 0;
  balanceInput.addEventListener('input', () => {
    onChange({ lifecycle: { unrecouped_balance: Number(balanceInput.value) || 0 } });
  });
  balanceField.append(balanceLabel, balanceInput);
  section.appendChild(balanceField);

  // Asset checklist
  const checklistLabel = el('div', 'label', 'Track Asset Folder Checklist');
  section.appendChild(checklistLabel);

  const checklist = el('div', 'lifecycle-form__checklist');
  const checklistItems = [
    ['has_full_mix', 'Full Mix'],
    ['has_instrumental', 'Instrumental'],
    ['has_stems_zipped', 'Stems (Zipped)'],
    ['has_clean_version', 'Clean Version'],
    ['has_embedded_metadata', 'Embedded ID3 / AIF Metadata'],
  ];

  checklistItems.forEach(([key, label]) => {
    const row = el('label', 'lifecycle-form__check-row');
    const cb = el('input');
    cb.type = 'checkbox';
    cb.checked = !!assetFolder[key];
    cb.addEventListener('change', () => {
      onChange({ assetFolder: { [key]: cb.checked } });
    });
    row.append(cb, el('span', '', label));
    checklist.appendChild(row);
  });
  section.appendChild(checklist);

  const urlField = el('div', 'field');
  const urlLabel = el('label', 'label', 'Sync Folder URL');
  const urlInput = el('input');
  urlInput.placeholder = 'https://drive.google.com/...';
  urlInput.value = assetFolder.sync_folder_url ?? '';
  urlInput.addEventListener('input', () => {
    onChange({ assetFolder: { sync_folder_url: urlInput.value.trim() } });
  });
  urlField.append(urlLabel, urlInput);
  section.appendChild(urlField);

  const seamlessRow = el('label', 'lifecycle-form__check-row lifecycle-form__check-row--highlight');
  const seamlessCb = el('input');
  seamlessCb.type = 'checkbox';
  seamlessCb.checked = !!lifecycle.is_clearance_seamless;
  seamlessCb.addEventListener('change', () => {
    onChange({ lifecycle: { is_clearance_seamless: seamlessCb.checked } });
  });
  seamlessRow.append(seamlessCb, el('span', '', 'Clearance path is seamless (Hollywood-ready)'));
  section.appendChild(seamlessRow);

  container.appendChild(section);
}

export function createEmptyLifecycleState() {
  return {
    assetFolder: defaultAssetFolder(),
    lifecycle: defaultLifecycleFields(),
  };
}
