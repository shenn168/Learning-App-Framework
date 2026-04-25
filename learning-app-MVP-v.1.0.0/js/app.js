// LearnFlow main application controller

import { loadCurriculumIndex, loadCurriculumFile } from './curriculum-loader.js';
import { validateCurriculumIndex, validateCurriculum } from './schema-validator.js';
import { parseRoute, onRouteChange, currentHash, navigate } from './router.js';
import * as state from './state.js';
import { loadPersistedState, saveLastPosition, saveActiveCurriculum, saveActiveTrack } from './storage.js';
import { clearView } from './ui.js';

// View renderers
import { renderHome } from './renderers/home.js';
import { renderTrack } from './renderers/track.js';
import { renderModule } from './renderers/module.js';
import { renderLesson } from './renderers/lesson.js';
import { renderGlossary } from './renderers/glossary.js';
import { renderProgress } from './renderers/progress.js';
import { renderSettings } from './renderers/settings.js';
import { renderErrorState, renderNotFoundState, renderLoadingState } from './renderers/error.js';

const viewContainer = () => document.getElementById('app-view');

/**
 * Route to the appropriate view renderer
 * @param {import('./router.js').ParsedRoute} route
 */
function renderView(route) {
  const container = viewContainer();
  clearView(container);

  // Update sidebar active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.route === route.view) {
      link.classList.add('active');
    }
  });

  // Save current route to state
  state.setActiveRoute(route.path);

  // Only save last position for non-lesson views
  // Lessons save their own position in the lesson renderer
  if (route.view !== 'lesson') {
    saveLastPosition(route.path, null);
  }

  switch (route.view) {
    case 'home':
      renderHome(container);
      break;
    case 'track':
      if (!route.params.trackId) {
        renderNotFoundState(container);
      } else {
        state.setActiveTrackId(route.params.trackId);
        saveActiveTrack(route.params.trackId);
        renderTrack(container, route.params);
      }
      break;
    case 'module':
      if (!route.params.trackId || !route.params.moduleId) {
        renderNotFoundState(container);
      } else {
        renderModule(container, route.params);
      }
      break;
    case 'lesson':
      if (!route.params.trackId || !route.params.moduleId || !route.params.lessonId) {
        renderNotFoundState(container);
      } else {
        renderLesson(container, route.params);
      }
      break;
    case 'glossary':
      renderGlossary(container);
      break;
    case 'progress':
      renderProgress(container);
      break;
    case 'settings':
      renderSettings(container);
      break;
    default:
      renderNotFoundState(container);
      break;
  }

  // Scroll to top on view change
  document.querySelector('.main-content').scrollTop = 0;
}

/**
 * Bootstrap the application
 */
async function init() {
  const container = viewContainer();
  clearView(container);
  renderLoadingState(container);

  try {
    // 1. Load persisted state from storage
    const persisted = await loadPersistedState();
    state.setCompletedLessonIds(persisted.completedLessonIds || []);
    state.setCompletedModuleIds(persisted.completedModuleIds || []);
    state.setAssessmentResults(persisted.assessmentResults || {});
    state.setNotes(persisted.notes || {});
    state.setBookmarks(persisted.bookmarks || []);
    state.setActiveCurriculumId(persisted.activeCurriculumId);
    state.setActiveTrackId(persisted.activeTrackId);

    // 2. Load curriculum index
    const index = await loadCurriculumIndex();
    const indexValidation = validateCurriculumIndex(index);
    if (!indexValidation.valid) {
      clearView(container);
      renderErrorState(container, 'Invalid Curriculum Index', `Validation errors: ${indexValidation.errors.join('; ')}`);
      return;
    }
    state.setCurriculumIndex(index);

    // 3. Load the first (and for MVP, only) curriculum
    if (index.curricula.length === 0) {
      clearView(container);
      renderErrorState(container, 'No Curriculum Available', 'The curriculum index is empty. No learning content is available.');
      return;
    }

    const curriculumEntry = index.curricula[0];
    const curriculum = await loadCurriculumFile(curriculumEntry.file);
    const curriculumValidation = validateCurriculum(curriculum);
    if (!curriculumValidation.valid) {
      clearView(container);
      renderErrorState(container, 'Invalid Curriculum Data', `The curriculum "${curriculumEntry.title}" has validation errors: ${curriculumValidation.errors.join('; ')}`);
      return;
    }

    state.setCurriculum(curriculum);
    state.setActiveCurriculumId(curriculumEntry.id);
    await saveActiveCurriculum(curriculumEntry.id);

    // 4. Set up routing
    onRouteChange((route) => renderView(route));

    // 5. Render the initial route
    const hash = currentHash();
    const initialRoute = parseRoute(hash);
    renderView(initialRoute);

  } catch (error) {
    console.error('LearnFlow init error:', error);
    clearView(container);
    renderErrorState(container, 'Failed to Load', `An error occurred while loading the application: ${error.message}`);
  }
}

// Keyboard navigation: arrow keys for prev/next in lessons
document.addEventListener('keydown', (e) => {
  const route = parseRoute(currentHash());
  if (route.view !== 'lesson') return;

  const lookups = state.getLookups();
  const { moduleId, trackId, lessonId } = route.params;
  const lessons = lookups.lessonsByModule[moduleId] || [];
  const idx = lessons.findIndex(l => l.id === lessonId);

  if (e.key === 'ArrowLeft' && idx > 0) {
    navigate(`#/lesson/${trackId}/${moduleId}/${lessons[idx - 1].id}`);
  } else if (e.key === 'ArrowRight' && idx < lessons.length - 1) {
    navigate(`#/lesson/${trackId}/${moduleId}/${lessons[idx + 1].id}`);
  }
});

// Boot
init();