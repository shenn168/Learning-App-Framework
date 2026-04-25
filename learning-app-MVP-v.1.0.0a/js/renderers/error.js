// Shared error and empty state renderers

import { el } from '../ui.js';
import { navigate } from '../router.js';

export function renderErrorState(container, title, message) {
  container.appendChild(el('div', { className: 'error-state' },
    el('div', { className: 'error-state-icon', textContent: '⚠️' }),
    el('h2', { className: 'error-state-title', textContent: title }),
    el('p', { className: 'error-state-text', textContent: message }),
    el('button', {
      className: 'btn btn-primary',
      textContent: 'Go Home',
      onClick: () => navigate('#/home')
    })
  ));
}

export function renderNotFoundState(container) {
  container.appendChild(el('div', { className: 'error-state' },
    el('div', { className: 'error-state-icon', textContent: '🔍' }),
    el('h2', { className: 'error-state-title', textContent: 'Page Not Found' }),
    el('p', { className: 'error-state-text', textContent: 'The page you are looking for does not exist.' }),
    el('button', {
      className: 'btn btn-primary',
      textContent: 'Go Home',
      onClick: () => navigate('#/home')
    })
  ));
}

export function renderLoadingState(container) {
  container.appendChild(el('div', { className: 'empty-state' },
    el('div', { className: 'empty-state-icon', textContent: '⏳' }),
    el('h2', { className: 'empty-state-title', textContent: 'Loading...' }),
    el('p', { className: 'empty-state-text', textContent: 'Preparing your learning experience.' })
  ));
}