import { el } from '../../ui.js';

export function renderParagraphBlock(block) {
  return el('p', { className: 'block-paragraph', textContent: block.text || '' });
}