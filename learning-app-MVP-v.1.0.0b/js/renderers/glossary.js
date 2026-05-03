// Glossary view renderer

import { el } from '../ui.js';
import * as state from '../state.js';

export function renderGlossary(container) {
  const curriculum = state.getCurriculum();

  if (!curriculum || !curriculum.glossary || curriculum.glossary.length === 0) {
    container.appendChild(el('div', { className: 'empty-state' },
      el('div', { className: 'empty-state-icon', textContent: '📖' }),
      el('h2', { className: 'empty-state-title', textContent: 'No glossary entries' }),
      el('p', { className: 'empty-state-text', textContent: 'This curriculum does not include glossary terms yet.' })
    ));
    return;
  }

  const fragment = document.createDocumentFragment();

  fragment.appendChild(el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: 'Glossary' }),
    el('p', { className: 'page-subtitle', textContent: `${curriculum.glossary.length} terms` })
  ));

  // Search
  const searchInput = el('input', {
    className: 'glossary-search',
    type: 'text',
    placeholder: 'Search terms...',
    'aria-label': 'Search glossary'
  });

  const listContainer = el('div', { className: 'glossary-list' });

  function renderTerms(filter) {
    listContainer.innerHTML = '';
    const terms = curriculum.glossary
      .filter(g => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q);
      })
      .sort((a, b) => a.term.localeCompare(b.term));

    if (terms.length === 0) {
      listContainer.appendChild(el('div', { className: 'empty-state' },
        el('div', { className: 'empty-state-icon', textContent: '🔍' }),
        el('p', { className: 'empty-state-text', textContent: 'No matching terms found.' })
      ));
      return;
    }

    for (const entry of terms) {
      const item = el('div', { className: 'glossary-item' },
        el('div', { className: 'glossary-term', textContent: entry.term }),
        el('div', { className: 'glossary-definition', textContent: entry.definition })
      );
      if (entry.category) {
        item.appendChild(el('span', { className: 'badge badge-primary glossary-category', textContent: entry.category }));
      }
      listContainer.appendChild(item);
    }
  }

  searchInput.addEventListener('input', () => renderTerms(searchInput.value));

  fragment.appendChild(searchInput);
  fragment.appendChild(listContainer);
  container.appendChild(fragment);

  renderTerms('');
}