// Hash-based router

/**
 * @typedef {Object} ParsedRoute
 * @property {string} path - The full hash path
 * @property {string} view - The top-level view name (e.g., "home", "lesson")
 * @property {Object} params - Extracted route params
 */

/**
 * Parse the current hash into a route object
 * @param {string} hash
 * @returns {ParsedRoute}
 */
export function parseRoute(hash) {
  const path = hash || '#/home';
  const segments = path.replace('#/', '').split('/').filter(Boolean);

  const view = segments[0] || 'home';
  const params = {};

  switch (view) {
    case 'track':
      params.trackId = segments[1] || null;
      break;
    case 'module':
      params.trackId = segments[1] || null;
      params.moduleId = segments[2] || null;
      break;
    case 'lesson':
      params.trackId = segments[1] || null;
      params.moduleId = segments[2] || null;
      params.lessonId = segments[3] || null;
      break;
    default:
      break;
  }

  return { path, view, params };
}

/**
 * Navigate to a hash route
 * @param {string} hash
 */
export function navigate(hash) {
  window.location.hash = hash;
}

/**
 * Get the current hash
 * @returns {string}
 */
export function currentHash() {
  return window.location.hash || '#/home';
}

/**
 * Register a callback for hash changes
 * @param {Function} callback
 */
export function onRouteChange(callback) {
  window.addEventListener('hashchange', () => {
    callback(parseRoute(window.location.hash));
  });
}