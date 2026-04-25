import { el } from '../../ui.js';

export function renderBulletsBlock(block) {
  const list = el('ul', { className: 'block-bullets' });
  for (const item of (block.items || [])) {
    list.appendChild(el('li', { textContent: item }));
  }
  return list;
}