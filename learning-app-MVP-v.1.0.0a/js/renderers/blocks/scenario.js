import { el } from '../../ui.js';

export function renderScenarioBlock(block) {
  return el('div', { className: 'block-scenario' },
    block.title ? el('div', { className: 'block-scenario-title', textContent: block.title }) : null,
    el('div', { className: 'block-scenario-text', textContent: block.text || '' })
  );
}