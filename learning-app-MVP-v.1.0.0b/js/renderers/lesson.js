// Lesson view renderer

import { el } from '../ui.js';
import * as state from '../state.js';
import { navigate } from '../router.js';
import { completeLesson } from '../progress.js';
import { renderBlocks } from './blocks/index.js';
import { formatDuration } from '../utils.js';
import { saveNotes, saveBookmarks, saveLastPosition } from '../storage.js';
import { debounce } from '../utils.js';

export function renderLesson(container, params) {
  const { trackId, moduleId, lessonId } = params;
  const lookups = state.getLookups();
  const track = lookups.tracksById[trackId];
  const mod = lookups.modulesById[moduleId];
  const lesson = lookups.lessonsById[lessonId];

  if (!track || !mod || !lesson) {
    container.appendChild(el('div', { className: 'error-state' },
      el('div', { className: 'error-state-icon', textContent: '🔍' }),
      el('h2', { className: 'error-state-title', textContent: 'Lesson not found' }),
      el('p', { className: 'error-state-text', textContent: 'The requested lesson could not be found.' }),
      el('button', { className: 'btn btn-primary', textContent: 'Go Home', onClick: () => navigate('#/home') })
    ));
    return;
  }

  // Validate cross-references
  if (lesson.moduleId !== moduleId || mod.trackId !== trackId) {
    container.appendChild(el('div', { className: 'error-state' },
      el('div', { className: 'error-state-icon', textContent: '⚠️' }),
      el('h2', { className: 'error-state-title', textContent: 'Invalid route' }),
      el('p', { className: 'error-state-text', textContent: 'This lesson does not match the specified track and module.' }),
      el('button', { className: 'btn btn-primary', textContent: 'Go Home', onClick: () => navigate('#/home') })
    ));
    return;
  }

  // Save position
  saveLastPosition(`#/lesson/${trackId}/${moduleId}/${lessonId}`, lesson.title);

  const fragment = document.createDocumentFragment();
  const currentRoute = `#/lesson/${trackId}/${moduleId}/${lessonId}`;

  // Breadcrumbs
  fragment.appendChild(el('nav', { className: 'breadcrumbs', 'aria-label': 'Breadcrumb' },
    el('a', { className: 'breadcrumb-link', href: '#/home', textContent: 'Home' }),
    el('span', { className: 'breadcrumb-sep', textContent: '/' }),
    el('a', { className: 'breadcrumb-link', href: `#/track/${trackId}`, textContent: track.title }),
    el('span', { className: 'breadcrumb-sep', textContent: '/' }),
    el('a', { className: 'breadcrumb-link', href: `#/module/${trackId}/${moduleId}`, textContent: mod.title }),
    el('span', { className: 'breadcrumb-sep', textContent: '/' }),
    el('span', { className: 'breadcrumb-current', textContent: lesson.title })
  ));

  // Lesson header with bookmark
  const isComplete = state.isLessonComplete(lessonId);
  const isBookmarked = state.isBookmarked(currentRoute);

  const headerRow = el('div', { style: 'display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;' });

  const headerLeft = el('div', { className: 'page-header', style: 'margin-bottom: 0;' },
    el('h1', { className: 'page-title', textContent: lesson.title }),
    lesson.summary ? el('p', { className: 'page-subtitle', textContent: lesson.summary }) : null,
    el('div', { className: 'page-meta' },
      lesson.estimatedMinutes ? el('span', { className: 'meta-item', textContent: `⏱ ${formatDuration(lesson.estimatedMinutes)}` }) : null,
      isComplete ? el('span', { className: 'badge badge-success', textContent: '✓ Completed' }) : null
    )
  );

  const bookmarkBtn = el('button', {
    className: `bookmark-btn${isBookmarked ? ' bookmarked' : ''}`,
    'aria-label': isBookmarked ? 'Remove bookmark' : 'Add bookmark',
    'aria-pressed': String(isBookmarked),
    textContent: isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark',
    onClick: () => {
      if (state.isBookmarked(currentRoute)) {
        state.removeBookmark(currentRoute);
        bookmarkBtn.classList.remove('bookmarked');
        bookmarkBtn.textContent = '🔖 Bookmark';
        bookmarkBtn.setAttribute('aria-pressed', 'false');
        bookmarkBtn.setAttribute('aria-label', 'Add bookmark');
      } else {
        state.addBookmark({
          route: currentRoute,
          title: lesson.title,
          addedAt: Date.now()
        });
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.textContent = '🔖 Bookmarked';
        bookmarkBtn.setAttribute('aria-pressed', 'true');
        bookmarkBtn.setAttribute('aria-label', 'Remove bookmark');
      }
      saveBookmarks(state.getBookmarks());
    }
  });

  headerRow.appendChild(headerLeft);
  headerRow.appendChild(bookmarkBtn);
  fragment.appendChild(headerRow);

  // Spacer
  fragment.appendChild(el('div', { style: 'height: 24px;' }));

  // Lesson blocks
  fragment.appendChild(renderBlocks(lesson.blocks));

  // Mark complete button
  const completeSection = el('div', { className: 'lesson-complete-section' });
  if (isComplete) {
    completeSection.appendChild(el('button', {
      className: 'btn btn-primary btn-lg lesson-complete-btn completed',
      textContent: '✓ Lesson Complete'
    }));
  } else {
    completeSection.appendChild(el('button', {
      className: 'btn btn-primary btn-lg lesson-complete-btn',
      textContent: 'Mark as Complete',
      onClick: async (e) => {
        await completeLesson(lessonId);
        e.target.textContent = '✓ Lesson Complete';
        e.target.classList.add('completed');
      }
    }));
  }
  fragment.appendChild(completeSection);

  // Prev/Next navigation
  const moduleLessons = lookups.lessonsByModule[moduleId] || [];
  const currentIndex = moduleLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null;

  const nav = el('div', { className: 'lesson-nav' });
  if (prevLesson) {
    nav.appendChild(el('button', {
      className: 'btn btn-secondary',
      textContent: `← ${prevLesson.title}`,
      'aria-label': `Previous lesson: ${prevLesson.title}`,
      onClick: () => navigate(`#/lesson/${trackId}/${moduleId}/${prevLesson.id}`)
    }));
  } else {
    nav.appendChild(el('div'));
  }
  if (nextLesson) {
    nav.appendChild(el('button', {
      className: 'btn btn-primary',
      textContent: `${nextLesson.title} →`,
      'aria-label': `Next lesson: ${nextLesson.title}`,
      onClick: () => navigate(`#/lesson/${trackId}/${moduleId}/${nextLesson.id}`)
    }));
  } else {
    nav.appendChild(el('button', {
      className: 'btn btn-secondary',
      textContent: 'Back to Module',
      onClick: () => navigate(`#/module/${trackId}/${moduleId}`)
    }));
  }
  fragment.appendChild(nav);

  // Notes panel
  const notesData = state.getNotes();
  const existingNote = notesData[currentRoute];

  const notesPanel = el('div', { className: 'notes-panel' });
  notesPanel.appendChild(el('h3', { className: 'notes-panel-title', textContent: '📝 Your Notes' }));

  const textarea = el('textarea', {
    className: 'notes-textarea',
    placeholder: 'Add your notes for this lesson...',
    'aria-label': 'Lesson notes'
  });
  if (existingNote) textarea.value = existingNote.text;

  const saveIndicator = el('span', { style: 'font-size: 12px; color: var(--color-text-muted);', textContent: '' });

  const debouncedSave = debounce(async () => {
    state.setNoteForRoute(currentRoute, textarea.value);
    await saveNotes(state.getNotes());
    saveIndicator.textContent = 'Saved ✓';
    setTimeout(() => { saveIndicator.textContent = ''; }, 2000);
  }, 500);

  textarea.addEventListener('input', debouncedSave);

  notesPanel.appendChild(textarea);
  notesPanel.appendChild(el('div', { className: 'notes-actions' }, saveIndicator));
  fragment.appendChild(notesPanel);

  container.appendChild(fragment);
}