// Knowledge check scoring and feedback logic

import * as state from './state.js';
import { saveAssessmentResult } from './storage.js';

/**
 * @typedef {Object} AssessmentResult
 * @property {string} selectedOptionId
 * @property {boolean} correct
 * @property {number} answeredAt - timestamp
 */

/**
 * Score a knowledge check answer
 * @param {Object} checkBlock - The knowledge-check block from curriculum
 * @param {string} selectedOptionId - The user's selected option id
 * @returns {AssessmentResult}
 */
export async function scoreKnowledgeCheck(checkBlock, selectedOptionId) {
  const selectedOption = checkBlock.options.find(o => o.id === selectedOptionId);
  const correct = selectedOption ? selectedOption.correct === true : false;

  const result = {
    selectedOptionId,
    correct,
    answeredAt: Date.now()
  };

  state.setAssessmentResult(checkBlock.id, result);
  await saveAssessmentResult(checkBlock.id, result);

  return result;
}

/**
 * Check if a knowledge check has been answered
 * @param {string} checkId
 * @returns {AssessmentResult|null}
 */
export function getCheckResult(checkId) {
  const results = state.getAssessmentResults();
  return results[checkId] || null;
}