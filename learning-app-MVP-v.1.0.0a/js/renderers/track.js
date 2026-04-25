// Track view renderer

import { el } from '../ui.js';
import * as state from '../state.js';
import { navigate } from '../router.js';
import { getTrackProgress, getModuleProgress } from '../progress.js';
import { formatDuration } from '../utils.js';

export function renderTrack(container, params) {
  const { trackId } = params;
  const lookups = state.getLookups();
  const track = lookups.tracksById[trackId];

  if (!track) {
    container.appendChild(renderNotFound('Track not found', `No track with id "${trackId}" exists.`));
    return;
  }

  const fragment = document.createDocumentFragment();

  // Breadcrumbs
  fragment.appendChild(el('nav', { className: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
    el('a', { className: 'breadcrumb-link', href: '#/home', textContent: 'Home' }),
    el('span', { className: 'breadcrumb-sep', textContent: '/' }),
    el('span', { className: 'breadcrumb-current', textContent: track.title })
  ));

  // Track header
  const progress = getTrackProgress(trackId);
  const headerMeta = el('div', { className: 'page-meta' });
  headerMeta.appendChild(el('span', { className: 'meta-item', textContent: `${progress.totalModules} modules` }));
  headerMeta.appendChild(el('span', { className: 'meta-item', textContent: `${progress.totalLessons} lessons` }));
  if (progress.percentage > 0) {
    headerMeta.appendChild(el('span', { className: 'badge badge-success', textContent: `${progress.percentage}% complete` }));
  }

  fragment.appendChild(el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: track.title }),
    el('p', { className: 'page-subtitle', textContent: track.summary || track.description || '' }),
    headerMeta
  ));

  if (progress.percentage > 0) {
    fragment.appendChild(el('div', { className: 'progress-bar-container', style: 'margin-bottom: 24px;' },
      el('div', { className: 'progress-bar-fill', style: `width: ${progress.percentage}%` })
    ));
  }

  // Modules list
  fragment.appendChild(el('h2', {
    className: 'block-heading',
    dataset: { level: '2' },
    textContent: 'Modules',
    style: 'margin-bottom: 16px;'
  }));

  const modules = lookups.modulesByTrack[trackId] || [];
  const moduleList = el('div', { style: 'display: flex; flex-direction: column; gap: 12px;' });

  modules.forEach(mod => {
    const modProgress = getModuleProgress(mod.id);
    const isComplete = state.isModuleComplete(mod.id);
    const lessons = lookups.lessonsByModule[mod.id] || [];

    const orderBadge = el('div', {
      className: `module-item-order${isComplete ? ' completed' : ''}`,
      textContent: isComplete ? '✓' : String(mod.order)
    });

    const metaText = [];
    if (lessons.length > 0) metaText.push(`${lessons.length} lessons`);
    if (mod.estimatedMinutes) metaText.push(formatDuration(mod.estimatedMinutes));
    if (modProgress.percentage > 0 && !isComplete) metaText.push(`${modProgress.percentage}%`);

    const item = el('div', {
      className: 'module-item',
      role: 'button',
      tabindex: '0',
      'aria-label': `Open module: ${mod.title}`,
      onClick: () => navigate(`#/module/${trackId}/${mod.id}`),
      onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`#/module/${trackId}/${mod.id}`); } }
    },
      orderBadge,
      el('div', { className: 'module-item-body' },
        el('div', { className: 'module-item-title', textContent: mod.title }),
        el('div', { className: 'module-item-meta', textContent: metaText.join(' · ') })
      )
    );

    moduleList.appendChild(item);
  });

  fragment.appendChild(moduleList);
  container.appendChild(fragment);
}

function renderNotFound(title, message) {
  return el('div', { className: 'error-state' },
    el('div', { className: 'error-state-icon', textContent: '🔍' }),
    el('h2', { className: 'error-state-title', textContent: title }),
    el('p', { className: 'error-state-text', textContent: message }),
    el('button', { className: 'btn btn-primary', textContent: 'Go Home', onClick: () => navigate('#/home') })
  );
}