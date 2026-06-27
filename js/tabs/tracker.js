import { el } from '../utils/dom.js';
import { dispatch, getState, subscribe } from '../state.js';
import { mountTrackForm } from '../components/track-form.js';
import { renderTrackCard } from '../components/track-card.js';

export function mountTrackerTab(container) {
  let showForm = false;
  let editingTrack = null;

  function render(s) {
    if (s.activeTab !== 'tracker') {
      showForm = false;
      editingTrack = null;
      return;
    }

    container.innerHTML = '';

    if (showForm) {
      const formWrap = el('div');
      container.appendChild(formWrap);
      mountTrackForm(formWrap, editingTrack,
        track => {
          const isEdit = !!editingTrack;
          showForm = false;
          editingTrack = null;
          dispatch({ type: isEdit ? 'UPDATE_TRACK' : 'ADD_TRACK', track });
        },
        () => {
          showForm = false;
          editingTrack = null;
          render(getState());
        }
      );
      if (s.tracks.length === 0) return;
    }

    if (!showForm) {
      const header = el('div', 'page-header');
      const title = el('h2', 'page-title', 'Your Tracks');
      const addBtn = el('button', 'btn btn-primary', '+ Add Track');
      addBtn.addEventListener('click', () => {
        showForm = true;
        editingTrack = null;
        render(getState());
      });
      header.append(title, addBtn);
      container.appendChild(header);
    }

    if (s.tracks.length === 0) {
      const empty = el('div', 'card-dashed');
      const icon = el('span', 'empty-icon', '🎵');
      const txt = el('p', 'empty-text', 'No tracks yet. Add your first track to start tracking splits.');
      const btn = el('button', 'btn btn-primary', 'Add Your First Track');
      btn.addEventListener('click', () => {
        showForm = true;
        editingTrack = null;
        render(getState());
      });
      empty.append(icon, txt, btn);
      container.appendChild(empty);
      return;
    }

    s.tracks.forEach(track => {
      const card = renderTrackCard(
        track,
        t => {
          showForm = true;
          editingTrack = t;
          render(getState());
        },
        id => dispatch({ type: 'DELETE_TRACK', id })
      );
      container.appendChild(card);
    });
  }

  subscribe(render);
  render(getState());
}
