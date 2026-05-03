// Loads local bundled JSON via fetch and chrome.runtime.getURL

/**
 * Load and parse a JSON file from the extension bundle
 * @param {string} relativePath - path relative to extension root
 * @returns {Promise<Object>}
 */
async function loadJSON(relativePath) {
  const url = chrome.runtime.getURL(relativePath);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Load the curriculum index
 * @returns {Promise<Object>}
 */
export async function loadCurriculumIndex() {
  return loadJSON('data/curriculum-index.json');
}

/**
 * Load a specific curriculum file
 * @param {string} filename
 * @returns {Promise<Object>}
 */
export async function loadCurriculumFile(filename) {
  return loadJSON(`data/${filename}`);
}