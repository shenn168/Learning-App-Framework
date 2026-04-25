// Module view renderer

import { el } from '../ui.js';
import * as state from '../state.js';
import { navigate } from '../router.js';
import { getModuleProgress } from '../progress.js';
import { formatDuration } from '../utils.js';

export function renderModule(container, params) {
  const { trackId, moduleId } = params;
  const lookups = state.getLookups();
  const track = lookups.tracksById[trackId];
  const mod = lookups.modulesById[moduleId];

  if (!track || !mod) {
    container.appendChild(el('div', { className: 'error-state' },
      el('div', { className: 'error-state-icon', textContent: '🔍' }),
      el('h2', { className: 'error-state-title', textContent: 'Not found' }),
      el('p', { className: 'error-state-text', textContent: 'The requested module could not be found.' }),
      el('button', { className: 'btn btn-primary', textContent: 'Go Home', onClick: () => navigate('#/home') })
    ));
    return;
  }

  // Validate that module belongs to this track
  if (mod.trackId !== trackId) {
    container.appendChild(el('div', { className: 'error-state' },
      el('div', { className: 'error-state-icon', textContent: '⚠️' }),
      el('h2', { className: 'error-state-title', textContent: 'Invalid route' }),
      el('p', { className: 'error-state-text', textContent: 'This module does not belong to the specified track.' }),
      el('button', { className: 'btn btn-primary', textContent: 'Go Home', onClick: () => navigate('#/home') })
    ));
    return;
  }

  const fragment = document.createDocumentFragment();

  // Breadcrumbs
  fragment.appendChild(el('nav', { className: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
    el('a', { className: 'breadcrumb-link', href: '#/home', textContent: 'Home' }),
    el('span', { className: 'breadcrumb-sep', textContent: '/' }),
    el('a', { className: 'breadcrumb-link', href: `#/track/${trackId}`, textContent: track.title }),
    el('span', { className: 'breadcrumb-sep', textContent: '/' }),
    el('span', { className: 'breadcrumb-current', textContent: mod.title })
  ));

  // Module header
  const progress = getModuleProgress(moduleId);
  const headerMeta = el('div', { className: 'page-meta' });
  const lessons = lookups.lessonsByModule[moduleId] || [];
  headerMeta.appendChild(el('span', { className: 'meta-item', textContent: `${lessons.length} lessons` }));
  if (mod.estimatedMinutes) {
    headerMeta.appendChild(el('span', { className: 'meta-item', textContent: `⏱ ${formatDuration(mod.estimatedMinutes)}` }));
  }
  if (progress.percentage > 0) {
    headerMeta.appendChild(el('span', { className: 'badge badge-success', textContent: `${progress.percentage}% complete` }));
  }

  fragment.appendChild(el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: mod.title }),
    el('p', { className: 'page-subtitle', textContent: mod.summary || '' }),
    headerMeta
  ));

  if (progress.percentage > 0) {
    fragment.appendChild(el('div', { className: 'progress-bar-container', style: 'margin-bottom: 24px;' },
      el('div', { className: 'progress-bar-fill', style: `width: ${progress.percentage}%` })
    ));
  }

  // Lesson list
  fragment.appendChild(el('h2', {
    className: 'block-heading',
    dataset: { level: '2' },
    textContent: 'Lessons',
    style: 'margin-bottom: 16px;'
  }));

  const lessonList = el('div', { style: 'display: flex; flex-direction: column; gap: 4px;' });

  lessons.forEach(lesson => {
    const isComplete = state.isLessonComplete(lesson.id);

    const checkIcon = el('div', {
      className: `lesson-item-check${isComplete ? ' completed' : ''}`,
      textContent: isComplete ? '✓' : ''
    });

    const item = el('div', {
      className: 'lesson-item',
      role: 'button',
      tabindex: '0',
      'aria-label': `${isComplete ? 'Completed: ' : ''}${lesson.title}`,
      onClick: () => navigate(`#/lesson/${trackId}/${moduleId}/${lesson.id}`),
      onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`#/lesson/${trackId}/${moduleId}/${lesson.id}`); } }
    },
      checkIcon,
      el('span', { className: 'lesson-item-title', textContent: lesson.title }),
      lesson.estimatedMinutes ? el('span', { className: 'lesson-item-time', textContent: formatDuration(lesson.estimatedMinutes) }) : null
    );

    lessonList.appendChild(item);
  });

  fragment.appendChild(lessonList);
  container.appendChild(fragment);
}