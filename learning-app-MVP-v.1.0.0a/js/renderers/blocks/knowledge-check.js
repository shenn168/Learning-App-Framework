import { el } from '../../ui.js';
import { scoreKnowledgeCheck, getCheckResult } from '../../assessment.js';

export function renderKnowledgeCheckBlock(block) {
  const existingResult = getCheckResult(block.id);

  const wrapper = el('div', { className: 'block-knowledge-check', role: 'group', 'aria-label': block.title || 'Knowledge Check' });

  if (block.title) {
    wrapper.appendChild(el('div', { className: 'kc-title', textContent: block.title }));
  }

  wrapper.appendChild(el('p', { className: 'kc-prompt', textContent: block.prompt || '' }));

  const optionsContainer = el('div', { className: 'kc-options' });
  const feedbackContainer = el('div', { style: 'min-height: 0;' });
  let selectedOptionId = existingResult ? existingResult.selectedOptionId : null;

  const optionElements = [];

  for (const option of (block.options || [])) {
    const radio = el('div', { className: 'kc-radio' });
    const optEl = el('div', {
      className: 'kc-option',
      role: 'radio',
      tabindex: '0',
      'aria-checked': 'false',
      'aria-label': option.text
    },
      radio,
      el('span', { className: 'kc-option-text', textContent: option.text })
    );

    optEl.dataset.optionId = option.id;
    optionElements.push(optEl);

    if (!existingResult) {
      const selectHandler = () => {
        selectedOptionId = option.id;
        optionElements.forEach(oe => {
          oe.classList.remove('selected');
          oe.setAttribute('aria-checked', 'false');
        });
        optEl.classList.add('selected');
        optEl.setAttribute('aria-checked', 'true');
      };
      optEl.addEventListener('click', selectHandler);
      optEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectHandler(); }
      });
    }

    optionsContainer.appendChild(optEl);
  }

  wrapper.appendChild(optionsContainer);

  // If already answered — show result state
  if (existingResult) {
    applyResultState(optionElements, block, existingResult, feedbackContainer);
  } else {
    // Submit button
    const submitBtn = el('button', {
      className: 'btn btn-primary btn-sm kc-submit-btn',
      textContent: 'Check Answer',
      onClick: async () => {
        if (!selectedOptionId) return;
        const result = await scoreKnowledgeCheck(block, selectedOptionId);
        applyResultState(optionElements, block, result, feedbackContainer);
        submitBtn.remove();
      }
    });
    wrapper.appendChild(submitBtn);
  }

  wrapper.appendChild(feedbackContainer);
  return wrapper;
}

function applyResultState(optionElements, block, result, feedbackContainer) {
  optionElements.forEach(oe => {
    oe.classList.add('disabled');
    const optId = oe.dataset.optionId;
    const opt = block.options.find(o => o.id === optId);

    if (opt && opt.correct) {
      oe.classList.add('correct');
    } else if (optId === result.selectedOptionId && !result.correct) {
      oe.classList.add('incorrect');
    }

    if (optId === result.selectedOptionId) {
      oe.classList.add('selected');
      oe.setAttribute('aria-checked', 'true');
    }
  });

  feedbackContainer.innerHTML = '';
  const feedbackText = result.correct ? (block.correctFeedback || 'Correct!') : (block.incorrectFeedback || 'Incorrect.');
  feedbackContainer.appendChild(el('div', {
    className: `kc-feedback ${result.correct ? 'correct' : 'incorrect'}`,
    textContent: feedbackText
  }));
}