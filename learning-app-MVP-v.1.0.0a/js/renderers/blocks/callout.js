import { el } from '../../ui.js';

export function renderCalloutBlock(block) {
  return el('div', { className: 'block-callout' },
    block.title ? el('div', { className: 'block-callout-title', textContent: block.title }) : null,
    el('div', { className: 'block-callout-text', textContent: block.text || '' })
  );
}