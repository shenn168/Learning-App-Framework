import { el } from '../../ui.js';

export function renderHeadingBlock(block) {
  const level = block.level || 3;
  const tag = `h${Math.min(Math.max(level, 2), 6)}`;
  return el(tag, {
    className: 'block-heading',
    dataset: { level: String(level) },
    textContent: block.text || ''
  });
}