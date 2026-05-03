// Home view renderer

import { el } from '../ui.js';
import * as state from '../state.js';
import { navigate } from '../router.js';
import { getTrackProgress, getOverallProgress } from '../progress.js';
import { formatDuration } from '../utils.js';

const TRACK_EMOJIS = ['🎯', '👤', '🔧', '📋', '🚀', '💡', '🔬', '📊'];

export function renderHome(container) {
  const curriculum = state.getCurriculum();
  const lookups = state.getLookups();

  if (!curriculum) {
    container.appendChild(renderError('No curriculum loaded', 'Could not find a valid curriculum to display.'));
    return;
  }

  const fragment = document.createDocumentFragment();

  // Resume banner
  const persisted = state.getActiveRoute();
  const lastRoute = persisted;
  // We check storage in app.js — here we just check if there's a meaningful last position
  const completedLessons = state.getCompletedLessonIds();
  if (completedLessons.length > 0) {
    const overall = getOverallProgress();
    const resumeBanner = el('div', { className: 'resume-banner' },
      el('p', { className: 'resume-banner-label', textContent: 'Your progress' }),
      el('p', { className: 'resume-banner-title', textContent: `${overall.percentage}% complete — ${overall.completedLessons} of ${overall.totalLessons} lessons` }),
      el('div', { className: 'progress-bar-container', style: 'background: rgba(255,255,255,0.2)' },
        el('div', { className: 'progress-bar-fill', style: `width: ${overall.percentage}%; background: rgba(255,255,255,0.9)` })
      )
    );
    fragment.appendChild(resumeBanner);
  }

  // Curriculum header
  const header = el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: curriculum.title }),
    el('p', { className: 'page-subtitle', textContent: curriculum.description || '' }),
    el('div', { className: 'page-meta' },
      curriculum.level ? el('span', { className: 'badge badge-primary', textContent: curriculum.level }) : null,
      curriculum.estimatedMinutes ? el('span', { className: 'meta-item', textContent: `⏱ ${formatDuration(curriculum.estimatedMinutes)}` }) : null,
      el('span', { className: 'meta-item', textContent: `📚 ${curriculum.tracks.length} tracks` })
    ).childNodes.length ? el('div', { className: 'page-meta' }) : null
  );

  // Rebuild header meta properly
  const metaDiv = el('div', { className: 'page-meta' });
  if (curriculum.level) {
    metaDiv.appendChild(el('span', { className: 'badge badge-primary', textContent: curriculum.level }));
  }
  if (curriculum.estimatedMinutes) {
    metaDiv.appendChild(el('span', { className: 'meta-item', textContent: `⏱ ${formatDuration(curriculum.estimatedMinutes)}` }));
  }
  metaDiv.appendChild(el('span', { className: 'meta-item', textContent: `📚 ${curriculum.tracks.length} tracks` }));

  const headerClean = el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: curriculum.title }),
    el('p', { className: 'page-subtitle', textContent: curriculum.description || '' }),
    metaDiv
  );
  fragment.appendChild(headerClean);

  // Track heading
  fragment.appendChild(el('h2', {
    className: 'block-heading',
    dataset: { level: '2' },
    textContent: 'Learning Tracks',
    style: 'margin-bottom: 16px;'
  }));

  // Track cards
  const grid = el('div', { className: 'card-grid card-grid-2' });

  const sortedTracks = [...curriculum.tracks].sort((a, b) => a.order - b.order);

  sortedTracks.forEach((track, index) => {
    const progress = getTrackProgress(track.id);
    const modules = lookups.modulesByTrack[track.id] || [];
    const emoji = track.icon || TRACK_EMOJIS[index % TRACK_EMOJIS.length];

    const card = el('div', {
      className: 'card card-clickable',
      role: 'button',
      tabindex: '0',
      'aria-label': `Open ${track.title} track`,
      onClick: () => navigate(`#/track/${track.id}`),
      onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`#/track/${track.id}`); } }
    },
      el('div', { className: 'track-card-emoji', textContent: emoji }),
      el('h3', { className: 'track-card-title', textContent: track.title }),
      el('p', { className: 'track-card-desc', textContent: track.description || '' }),
      el('div', { className: 'page-meta', style: 'margin-top: 12px;' },
        el('span', { className: 'meta-item', textContent: `${modules.length} modules` }),
        progress.percentage > 0 ? el('span', { className: 'badge badge-success', textContent: `${progress.percentage}%` }) : null
      )
    );

    if (progress.percentage > 0) {
      const bar = el('div', { className: 'progress-bar-container', style: 'margin-top: 12px;' },
        el('div', { className: 'progress-bar-fill', style: `width: ${progress.percentage}%` })
      );
      card.appendChild(bar);
    }

    grid.appendChild(card);
  });

  fragment.appendChild(grid);
  container.appendChild(fragment);
}

function renderError(title, message) {
  return el('div', { className: 'error-state' },
    el('div', { className: 'error-state-icon', textContent: '⚠️' }),
    el('h2', { className: 'error-state-title', textContent: title }),
    el('p', { className: 'error-state-text', textContent: message })
  );
}