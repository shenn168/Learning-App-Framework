// In-memory runtime state with lookup maps

/** @type {Object|null} */
let curriculumIndex = null;

/** @type {Object|null} */
let curriculum = null;

/** @type {Object} Lookup maps built at load time */
let lookups = {
  tracksById: {},
  modulesById: {},
  lessonsById: {},
  modulesByTrack: {},
  lessonsByModule: {},
  lessonToTrack: {}
};

/** @type {string} */
let activeRoute = '#/home';

/** @type {string|null} */
let activeTrackId = null;

/** @type {string|null} */
let activeCurriculumId = null;

/** @type {string[]} */
let completedLessonIds = [];

/** @type {string[]} */
let completedModuleIds = [];

/** @type {Object} */
let assessmentResults = {};

/** @type {Object} notes keyed by route */
let notes = {};

/** @type {Array} bookmark objects */
let bookmarks = [];

// ----- Getters -----

export function getCurriculumIndex() { return curriculumIndex; }
export function getCurriculum() { return curriculum; }
export function getLookups() { return lookups; }
export function getActiveRoute() { return activeRoute; }
export function getActiveTrackId() { return activeTrackId; }
export function getActiveCurriculumId() { return activeCurriculumId; }
export function getCompletedLessonIds() { return [...completedLessonIds]; }
export function getCompletedModuleIds() { return [...completedModuleIds]; }
export function getAssessmentResults() { return { ...assessmentResults }; }
export function getNotes() { return { ...notes }; }
export function getBookmarks() { return [...bookmarks]; }

// ----- Setters -----

export function setCurriculumIndex(idx) { curriculumIndex = idx; }

export function setCurriculum(cur) {
  curriculum = cur;
  buildLookups();
}

export function setActiveRoute(route) { activeRoute = route; }
export function setActiveTrackId(id) { activeTrackId = id; }
export function setActiveCurriculumId(id) { activeCurriculumId = id; }
export function setCompletedLessonIds(ids) { completedLessonIds = [...ids]; }
export function setCompletedModuleIds(ids) { completedModuleIds = [...ids]; }
export function setAssessmentResults(results) { assessmentResults = { ...results }; }
export function setNotes(n) { notes = { ...n }; }
export function setBookmarks(b) { bookmarks = [...b]; }

// ----- Mutation helpers -----

export function markLessonComplete(lessonId) {
  if (!completedLessonIds.includes(lessonId)) {
    completedLessonIds.push(lessonId);
  }
}

export function markModuleComplete(moduleId) {
  if (!completedModuleIds.includes(moduleId)) {
    completedModuleIds.push(moduleId);
  }
}

export function setAssessmentResult(checkId, result) {
  assessmentResults[checkId] = result;
}

export function setNoteForRoute(route, text) {
  if (text && text.trim()) {
    notes[route] = { text: text.trim(), updatedAt: Date.now() };
  } else {
    delete notes[route];
  }
}

export function addBookmark(bookmark) {
  if (!bookmarks.find(b => b.route === bookmark.route)) {
    bookmarks.push(bookmark);
  }
}

export function removeBookmark(route) {
  bookmarks = bookmarks.filter(b => b.route !== route);
}

export function isBookmarked(route) {
  return bookmarks.some(b => b.route === route);
}

export function isLessonComplete(lessonId) {
  return completedLessonIds.includes(lessonId);
}

export function isModuleComplete(moduleId) {
  return completedModuleIds.includes(moduleId);
}

// ----- Lookup builder -----

function buildLookups() {
  if (!curriculum) return;

  const tracksById = {};
  const modulesById = {};
  const lessonsById = {};
  const modulesByTrack = {};
  const lessonsByModule = {};
  const lessonToTrack = {};

  for (const track of curriculum.tracks || []) {
    tracksById[track.id] = track;
    modulesByTrack[track.id] = [];
  }

  for (const mod of curriculum.modules || []) {
    modulesById[mod.id] = mod;
    if (!modulesByTrack[mod.trackId]) modulesByTrack[mod.trackId] = [];
    modulesByTrack[mod.trackId].push(mod);
    lessonsByModule[mod.id] = [];
  }

  // Sort modules by order within each track
  for (const trackId in modulesByTrack) {
    modulesByTrack[trackId].sort((a, b) => a.order - b.order);
  }

  for (const lesson of curriculum.lessons || []) {
    lessonsById[lesson.id] = lesson;
    if (!lessonsByModule[lesson.moduleId]) lessonsByModule[lesson.moduleId] = [];
    lessonsByModule[lesson.moduleId].push(lesson);

    // Resolve lesson -> track via module
    const mod = modulesById[lesson.moduleId];
    if (mod) {
      lessonToTrack[lesson.id] = mod.trackId;
    }
  }

  // Sort lessons by order within each module
  for (const moduleId in lessonsByModule) {
    lessonsByModule[moduleId].sort((a, b) => a.order - b.order);
  }

  lookups = { tracksById, modulesById, lessonsById, modulesByTrack, lessonsByModule, lessonToTrack };
}

// ----- Reset -----

export function resetState() {
  activeTrackId = null;
  completedLessonIds = [];
  completedModuleIds = [];
  assessmentResults = {};
  notes = {};
  bookmarks = [];
}