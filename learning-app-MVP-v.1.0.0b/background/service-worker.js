// LearnFlow background service worker
// Minimal for MVP — future-ready for expansion

const STORAGE_SCHEMA_VERSION = 1;

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
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
    });
  }

  if (details.reason === 'update') {
    const data = await chrome.storage.local.get('storageSchemaVersion');
    const currentVersion = data.storageSchemaVersion || 0;
    if (currentVersion < STORAGE_SCHEMA_VERSION) {
      await migrateStorage(currentVersion, STORAGE_SCHEMA_VERSION);
    }
  }
});

async function migrateStorage(fromVersion, toVersion) {
  // Migration stubs for future schema changes
  // Each migration step handles fromVersion -> fromVersion + 1
  let version = fromVersion;
  while (version < toVersion) {
    switch (version) {
      case 0:
        // Migration from unversioned to version 1
        const data = await chrome.storage.local.get(null);
        if (!data.bookmarks) {
          await chrome.storage.local.set({ bookmarks: [] });
        }
        if (!data.notes) {
          await chrome.storage.local.set({ notes: {} });
        }
        if (!data.assessmentResults) {
          await chrome.storage.local.set({ assessmentResults: {} });
        }
        break;
      default:
        break;
    }
    version++;
  }
  await chrome.storage.local.set({ storageSchemaVersion: toVersion });
}