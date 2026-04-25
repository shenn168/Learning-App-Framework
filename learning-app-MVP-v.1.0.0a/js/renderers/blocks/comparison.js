import { el } from '../../ui.js';

export function renderComparisonBlock(block) {
  const grid = el('div', { className: 'block-comparison' });
  for (const col of (block.columns || [])) {
    grid.appendChild(el('div', { className: 'comparison-column' },
      el('h4', { className: 'comparison-column-title', textContent: col.title || '' }),
      el('p', { className: 'comparison-column-text', textContent: col.text || '' })
    ));
  }
  return grid;
}