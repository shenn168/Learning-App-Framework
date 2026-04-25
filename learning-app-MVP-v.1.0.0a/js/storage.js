// Wrapper around chrome.storage.local with schema versioning

const STORAGE_SCHEMA_VERSION = 1;

const DEFAULT_STATE = {
  storageSchemaVersion: STORAGE_SCHEMA_VERSION,
  activeCurriculumId: null,
  lastRoute: '#/home',
  lastLessonTitle: null,
  activeTrackId: null,
  completedLessonIds: [],
  completedModuleIds: [],
  assessmentResults: {},
  notes: {},
  bookmarks: []
};

/**
 * Get a value from storage
 * @param {string|string[]} keys
 * @returns {Promise<Object>}
 */
export async function storageGet(keys) {
  return chrome.storage.local.get(keys);
}

/**
 * Set values in storage
 * @param {Object} data
 * @returns {Promise<void>}
 */
export async function storageSet(data) {
  return chrome.storage.local.set(data);
}

/**
 * Get the full persisted state
 * @returns {Promise<Object>}
 */
export async function loadPersistedState() {
  const data = await chrome.storage.local.get(null);
  // Merge with defaults to ensure all keys exist
  return { ...DEFAULT_STATE, ...data };
}

/**
 * Save last route and lesson title
 * @param {string} route
 * @param {string|null} lessonTitle
 */
export async function saveLastPosition(route, lessonTitle) {
  await storageSet({ lastRoute: route, lastLessonTitle: lessonTitle });
}

/**
 * Save completed lessons array
 * @param {string[]} ids
 */
export async function saveCompletedLessons(ids) {
  await storageSet({ completedLessonIds: ids });
}

/**
 * Save completed modules array
 * @param {string[]} ids
 */
export async function saveCompletedModules(ids) {
  await storageSet({ completedModuleIds: ids });
}

/**
 * Save assessment result
 * @param {string} checkId
 * @param {Object} result
 */
export async function saveAssessmentResult(checkId, result) {
  const data = await storageGet('assessmentResults');
  const results = data.assessmentResults || {};
  results[checkId] = result;
  await storageSet({ assessmentResults: results });
}

/**
 * Save notes object
 * @param {Object} notes
 */
export async function saveNotes(notes) {
  await storageSet({ notes });
}

/**
 * Save bookmarks array
 * @param {Array} bookmarks
 */
export async function saveBookmarks(bookmarks) {
  await storageSet({ bookmarks });
}

/**
 * Save active track
 * @param {string} trackId
 */
export async function saveActiveTrack(trackId) {
  await storageSet({ activeTrackId: trackId });
}

/**
 * Save active curriculum
 * @param {string} curriculumId
 */
export async function saveActiveCurriculum(curriculumId) {
  await storageSet({ activeCurriculumId: curriculumId });
}

/**
 * Reset all progress data
 */
export async function resetAllProgress() {
  await storageSet({
    lastRoute: '#/home',
    lastLessonTitle: null,
    activeTrackId: null,
    completedLessonIds: [],
    completedModuleIds: [],
    assessmentResults: {},
    notes: {},
    bookmarks: []
  });
}