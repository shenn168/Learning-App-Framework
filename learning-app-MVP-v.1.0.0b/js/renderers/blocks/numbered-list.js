import { el } from '../../ui.js';

export function renderNumberedListBlock(block) {
  const list = el('ol', { className: 'block-numbered-list' });
  for (const item of (block.items || [])) {
    list.appendChild(el('li', { textContent: item }));
  }
  return list;
}