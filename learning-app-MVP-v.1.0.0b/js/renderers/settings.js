// Settings view renderer

import { el, showConfirmDialog } from '../ui.js';
import * as state from '../state.js';
import { resetAllProgress } from '../storage.js';
import { navigate } from '../router.js';

export function renderSettings(container) {
  const fragment = document.createDocumentFragment();

  fragment.appendChild(el('div', { className: 'page-header' },
    el('h1', { className: 'page-title', textContent: 'Settings' }),
    el('p', { className: 'page-subtitle', textContent: 'Manage your learning preferences' })
  ));

  // Local-first explanation
  const localSection = el('div', { className: 'card settings-section', style: 'margin-bottom: 24px;' },
    el('h2', { className: 'settings-section-title', textContent: '🔒 Local-First Learning' }),
    el('p', { className: 'settings-section-text', textContent: 'All your progress, notes, and bookmarks are stored locally on this device using your browser\'s built-in storage. Nothing is sent to any server.' }),
    el('p', { className: 'settings-section-text', textContent: 'This means your data is private and available offline, but it does not sync across devices or browsers.' })
  );
  fragment.appendChild(localSection);

  // Curriculum info
  const curriculum = state.getCurriculum();
  if (curriculum) {
    const infoSection = el('div', { className: 'card settings-section', style: 'margin-bottom: 24px;' },
      el('h2', { className: 'settings-section-title', textContent: '📘 Active Curriculum' }),
      el('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Title' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: curriculum.title })
        ),
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Version' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: curriculum.version || 'N/A' })
        ),
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Language' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: curriculum.language || 'en' })
        ),
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Tracks' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: String(curriculum.tracks.length) })
        ),
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Modules' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: String(curriculum.modules.length) })
        ),
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Lessons' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: String(curriculum.lessons.length) })
        ),
        el('div', { style: 'display: flex; justify-content: space-between;' },
          el('span', { style: 'font-size: 14px; color: var(--color-text-muted);', textContent: 'Glossary terms' }),
          el('span', { style: 'font-size: 14px; font-weight: 600;', textContent: String(curriculum.glossary.length) })
        )
      )
    );
    fragment.appendChild(infoSection);
  }

  // References section
  if (curriculum && curriculum.references && curriculum.references.length > 0) {
    const refsSection = el('div', { className: 'card settings-section', style: 'margin-bottom: 24px;' },
      el('h2', { className: 'settings-section-title', textContent: '🔗 References' })
    );
    const refList = el('div', { style: 'display: flex; flex-direction: column; gap: 8px;' });
    for (const ref of curriculum.references) {
      refList.appendChild(el('div', { style: 'display: flex; align-items: center; gap: 8px;' },
        el('span', { textContent: '→', style: 'color: var(--color-primary);' }),
        el('a', {
          href: ref.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          textContent: ref.title,
          style: 'font-size: 14px; color: var(--color-primary); text-decoration: none; font-weight: 500;'
        })
      ));
    }
    refsSection.appendChild(refList);
    fragment.appendChild(refsSection);
  }

  // Danger zone
  const dangerSection = el('div', { className: 'card settings-section', style: 'border-color: rgba(239, 68, 68, 0.3);' },
    el('h2', { className: 'settings-section-title', style: 'color: var(--color-error);', textContent: '⚠️ Danger Zone' }),
    el('p', { className: 'settings-section-text', textContent: 'Resetting progress will permanently erase all your completed lessons, modules, notes, bookmarks, and quiz results. This cannot be undone.' }),
    el('button', {
      className: 'btn btn-danger',
      textContent: 'Reset All Progress',
      onClick: () => {
        showConfirmDialog(
          'Reset All Progress',
          'Are you sure you want to erase all progress, notes, bookmarks, and quiz results? This action cannot be undone.',
          'Reset Everything',
          async () => {
            state.resetState();
            await resetAllProgress();
            navigate('#/home');
          }
        );
      }
    })
  );
  fragment.appendChild(dangerSection);

  container.appendChild(fragment);
}