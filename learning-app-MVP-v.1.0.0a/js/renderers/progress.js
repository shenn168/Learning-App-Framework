// Progress view renderer

import { el } from '../ui.js';
import * as state from '../state.js';
import { navigate } from '../router.js';
import { getOverallProgress, getTrackProgress } from '../progress.js';
import { saveBookmarks } from '../storage.js';

export function renderProgress(container) {
  const curriculum = state.getCurriculum();

  if (!curriculum) {
    container.appendChild(el('div', { className: 'empty-state' },
      el('div', { className: 'empty-state-icon', textContent: '📊' }),
      el('h2', { className: 'empty-state-title', textContent: 'No curriculum loaded' }),
      el('p', { className: 'empty-state-text', textContent: 'Load a curriculum to track your progress.' })
    ));
    return;
  }

  const fragment = document.createDocumentFragment();
  const overall = getOverallProgress();

  fragment.appendChild(el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: 'Your Progress' }),
    el('p', { className: 'page-subtitle', textContent: curriculum.title })
  ));

  // Overall stats card
  const statsCard = el('div', { className: 'card', style: 'margin-bottom: 24px;' });

  const statsHeader = el('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' },
    el('h2', { style: 'font-size: 18px; font-weight: 700;', textContent: 'Overall Completion' }),
    el('span', { style: 'font-size: 28px; font-weight: 700; color: var(--color-primary);', textContent: `${overall.percentage}%` })
  );
  statsCard.appendChild(statsHeader);

  statsCard.appendChild(el('div', { className: 'progress-bar-container', style: 'margin-bottom: 16px;' },
    el('div', { className: 'progress-bar-fill', style: `width: ${overall.percentage}%` })
  ));

  const statsRow = el('div', { style: 'display: flex; gap: 24px;' });

  const lessonStat = el('div', {},
    el('div', { style: 'font-size: 24px; font-weight: 700; color: var(--color-text);', textContent: `${overall.completedLessons}` }),
    el('div', { style: 'font-size: 13px; color: var(--color-text-muted);', textContent: `of ${overall.totalLessons} lessons` })
  );
  statsRow.appendChild(lessonStat);

  const moduleStat = el('div', {},
    el('div', { style: 'font-size: 24px; font-weight: 700; color: var(--color-text);', textContent: `${overall.completedModules}` }),
    el('div', { style: 'font-size: 13px; color: var(--color-text-muted);', textContent: `of ${overall.totalModules} modules` })
  );
  statsRow.appendChild(moduleStat);

  const trackCount = curriculum.tracks.length;
  const completedTracks = curriculum.tracks.filter(t => {
    const tp = getTrackProgress(t.id);
    return tp.percentage === 100;
  }).length;

  const trackStat = el('div', {},
    el('div', { style: 'font-size: 24px; font-weight: 700; color: var(--color-text);', textContent: `${completedTracks}` }),
    el('div', { style: 'font-size: 13px; color: var(--color-text-muted);', textContent: `of ${trackCount} tracks` })
  );
  statsRow.appendChild(trackStat);

  statsCard.appendChild(statsRow);
  fragment.appendChild(statsCard);

  // Per-track breakdown
  fragment.appendChild(el('h2', {
    className: 'block-heading',
    dataset: { level: '2' },
    textContent: 'Track Breakdown',
    style: 'margin-bottom: 16px;'
  }));

  const trackGrid = el('div', { className: 'card-grid card-grid-2', style: 'margin-bottom: 32px;' });

  const sortedTracks = [...curriculum.tracks].sort((a, b) => a.order - b.order);
  for (const track of sortedTracks) {
    const tp = getTrackProgress(track.id);
    const trackCard = el('div', { className: 'card' },
      el('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;' },
        el('h3', { style: 'font-size: 16px; font-weight: 700;', textContent: track.title }),
        el('span', { className: `badge ${tp.percentage === 100 ? 'badge-success' : 'badge-primary'}`, textContent: `${tp.percentage}%` })
      ),
      el('div', { className: 'progress-bar-container', style: 'margin-bottom: 8px;' },
        el('div', { className: 'progress-bar-fill', style: `width: ${tp.percentage}%` })
      ),
      el('div', { style: 'font-size: 13px; color: var(--color-text-muted);', textContent: `${tp.completedLessons} of ${tp.totalLessons} lessons · ${tp.completedModules} of ${tp.totalModules} modules` })
    );
    trackGrid.appendChild(trackCard);
  }

  fragment.appendChild(trackGrid);

  // Bookmarks section
  const bookmarks = state.getBookmarks();

  fragment.appendChild(el('h2', {
    className: 'block-heading',
    dataset: { level: '2' },
    textContent: 'Bookmarks',
    style: 'margin-bottom: 16px;'
  }));

  if (bookmarks.length === 0) {
    fragment.appendChild(el('div', { className: 'card' },
      el('div', { className: 'empty-state', style: 'padding: 24px;' },
        el('div', { className: 'empty-state-icon', textContent: '🔖' }),
        el('p', { className: 'empty-state-text', textContent: 'No bookmarks yet. Bookmark lessons while learning to find them here.' })
      )
    ));
  } else {
    const bookmarkList = el('div', { className: 'bookmarks-list' });

    for (const bm of bookmarks) {
      const entry = el('div', { className: 'bookmark-entry' },
        el('a', {
          className: 'bookmark-entry-link',
          href: bm.route,
          textContent: bm.title || bm.route,
          onClick: (e) => {
            e.preventDefault();
            navigate(bm.route);
          }
        }),
        el('button', {
          className: 'bookmark-entry-remove',
          'aria-label': `Remove bookmark: ${bm.title}`,
          textContent: '✕',
          onClick: () => {
            state.removeBookmark(bm.route);
            saveBookmarks(state.getBookmarks());
            entry.remove();
            // If list is now empty, re-render
            if (state.getBookmarks().length === 0) {
              container.innerHTML = '';
              renderProgress(container);
            }
          }
        })
      );
      bookmarkList.appendChild(entry);
    }

    fragment.appendChild(bookmarkList);
  }

  // Assessment results summary
  const assessmentResults = state.getAssessmentResults();
  const resultKeys = Object.keys(assessmentResults);

  if (resultKeys.length > 0) {
    fragment.appendChild(el('h2', {
      className: 'block-heading',
      dataset: { level: '2' },
      textContent: 'Knowledge Checks',
      style: 'margin-top: 32px; margin-bottom: 16px;'
    }));

    const correctCount = resultKeys.filter(k => assessmentResults[k].correct).length;
    const totalCount = resultKeys.length;

    const assessCard = el('div', { className: 'card' },
      el('div', { style: 'display: flex; justify-content: space-between; align-items: center;' },
        el('div', {},
          el('div', { style: 'font-size: 16px; font-weight: 700; color: var(--color-text);', textContent: 'Results' }),
          el('div', { style: 'font-size: 13px; color: var(--color-text-muted); margin-top: 4px;', textContent: `${correctCount} correct out of ${totalCount} attempted` })
        ),
        el('span', {
          style: `font-size: 28px; font-weight: 700; color: ${correctCount === totalCount ? 'var(--color-success)' : 'var(--color-primary)'};`,
          textContent: totalCount > 0 ? `${Math.round((correctCount / totalCount) * 100)}%` : '0%'
        })
      )
    );

    fragment.appendChild(assessCard);
  }

  container.appendChild(fragment);
}