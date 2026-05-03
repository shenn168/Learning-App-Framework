// UI helper utilities for element creation

/**
 * Create an HTML element with attributes and children
 * @param {string} tag
 * @param {Object} attrs
 * @param  {...(HTMLElement|string)} children
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(value)) {
        element.dataset[dk] = dv;
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.substring(2).toLowerCase();
      element.addEventListener(event, value);
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'htmlFor') {
      element.htmlFor = value;
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Clear all children from an element
 * @param {HTMLElement} container
 */
export function clearView(container) {
  container.innerHTML = '';
}

/**
 * Build a confirmation dialog
 * @param {string} title
 * @param {string} message
 * @param {string} confirmLabel
 * @param {Function} onConfirm
 */
export function showConfirmDialog(title, message, confirmLabel, onConfirm) {
  const overlay = el('div', { className: 'confirm-overlay' },
    el('div', { className: 'confirm-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      el('h2', { className: 'confirm-title', textContent: title }),
      el('p', { className: 'confirm-text', textContent: message }),
      el('div', { className: 'confirm-actions' },
        el('button', {
          className: 'btn btn-ghost',
          textContent: 'Cancel',
          onClick: () => overlay.remove()
        }),
        el('button', {
          className: 'btn btn-danger',
          textContent: confirmLabel,
          onClick: () => {
            overlay.remove();
            onConfirm();
          }
        })
      )
    )
  );

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  document.body.appendChild(overlay);
}