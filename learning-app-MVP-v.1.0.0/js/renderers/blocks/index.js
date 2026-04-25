// Block renderer registry

import { renderHeadingBlock } from './heading.js';
import { renderParagraphBlock } from './paragraph.js';
import { renderBulletsBlock } from './bullets.js';
import { renderNumberedListBlock } from './numbered-list.js';
import { renderCalloutBlock } from './callout.js';
import { renderScenarioBlock } from './scenario.js';
import { renderComparisonBlock } from './comparison.js';
import { renderKnowledgeCheckBlock } from './knowledge-check.js';
import { el } from '../../ui.js';

const blockRenderers = {
  'heading': renderHeadingBlock,
  'paragraph': renderParagraphBlock,
  'bullets': renderBulletsBlock,
  'numbered-list': renderNumberedListBlock,
  'callout': renderCalloutBlock,
  'scenario': renderScenarioBlock,
  'comparison': renderComparisonBlock,
  'knowledge-check': renderKnowledgeCheckBlock
};

/**
 * Render a single block
 * @param {Object} block
 * @returns {HTMLElement}
 */
export function renderBlock(block) {
  const renderer = blockRenderers[block.type];
  if (renderer) {
    return renderer(block);
  }
  // Unknown block type — render a warning
  return el('div', { className: 'block-callout', style: 'border-left-color: #94a3b8;' },
    el('div', { className: 'block-callout-title', textContent: `Unknown block type: "${block.type}"` }),
    el('div', { className: 'block-callout-text', textContent: 'This content block is not supported in this version.' })
  );
}

/**
 * Render all blocks for a lesson
 * @param {Array} blocks
 * @returns {HTMLElement}
 */
export function renderBlocks(blocks) {
  const container = el('div', { className: 'lesson-blocks' });
  for (const block of (blocks || [])) {
    const rendered = renderBlock(block);
    if (rendered) container.appendChild(rendered);
  }
  return container;
}