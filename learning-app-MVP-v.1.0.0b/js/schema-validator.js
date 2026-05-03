// Validates curriculum JSON structure before rendering

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 */

/**
 * Validate a curriculum object
 * @param {Object} curriculum
 * @returns {ValidationResult}
 */
export function validateCurriculum(curriculum) {
  const errors = [];

  if (!curriculum || typeof curriculum !== 'object') {
    return { valid: false, errors: ['Curriculum is not a valid object.'] };
  }

  // Required top-level fields
  const requiredFields = ['id', 'title', 'version', 'tracks', 'modules', 'lessons', 'glossary', 'references'];
  for (const field of requiredFields) {
    if (!(field in curriculum)) {
      errors.push(`Missing required top-level field: "${field}".`);
    }
  }

  // Array checks
  const arrayFields = ['tracks', 'modules', 'lessons', 'glossary', 'references'];
  for (const field of arrayFields) {
    if (field in curriculum && !Array.isArray(curriculum[field])) {
      errors.push(`Field "${field}" must be an array.`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Build id sets for cross-reference validation
  const trackIds = new Set();
  const moduleIds = new Set();

  // Validate tracks
  for (const track of curriculum.tracks) {
    if (!track.id || !track.title) {
      errors.push(`Track missing required field "id" or "title": ${JSON.stringify(track)}`);
    }
    if (trackIds.has(track.id)) {
      errors.push(`Duplicate track id: "${track.id}".`);
    }
    trackIds.add(track.id);
  }

  // Validate modules — check for duplicate order within same track
  const moduleOrderByTrack = {};
  for (const mod of curriculum.modules) {
    if (!mod.id || !mod.trackId || !mod.title) {
      errors.push(`Module missing required field(s): ${JSON.stringify(mod)}`);
    }
    if (!trackIds.has(mod.trackId)) {
      errors.push(`Module "${mod.id}" references invalid trackId "${mod.trackId}".`);
    }
    if (moduleIds.has(mod.id)) {
      errors.push(`Duplicate module id: "${mod.id}".`);
    }
    moduleIds.add(mod.id);

    // Check duplicate order within track
    if (!moduleOrderByTrack[mod.trackId]) moduleOrderByTrack[mod.trackId] = new Set();
    if (moduleOrderByTrack[mod.trackId].has(mod.order)) {
      errors.push(`Duplicate order ${mod.order} for modules in track "${mod.trackId}".`);
    }
    moduleOrderByTrack[mod.trackId].add(mod.order);
  }

  // Validate lessons — check for duplicate order within same module
  const lessonOrderByModule = {};
  for (const lesson of curriculum.lessons) {
    if (!lesson.id || !lesson.moduleId || !lesson.title || !Array.isArray(lesson.blocks)) {
      errors.push(`Lesson missing required field(s) (id, moduleId, title, blocks): ${JSON.stringify({ id: lesson.id, moduleId: lesson.moduleId })}`);
    }
    if (!moduleIds.has(lesson.moduleId)) {
      errors.push(`Lesson "${lesson.id}" references invalid moduleId "${lesson.moduleId}".`);
    }

    if (!lessonOrderByModule[lesson.moduleId]) lessonOrderByModule[lesson.moduleId] = new Set();
    if (lessonOrderByModule[lesson.moduleId].has(lesson.order)) {
      errors.push(`Duplicate order ${lesson.order} for lessons in module "${lesson.moduleId}".`);
    }
    lessonOrderByModule[lesson.moduleId].add(lesson.order);
  }

  // Validate glossary entries
  for (const entry of curriculum.glossary) {
    if (!entry.term || !entry.definition) {
      errors.push(`Glossary entry missing "term" or "definition".`);
    }
  }

  // Validate references
  for (const ref of curriculum.references) {
    if (!ref.title || !ref.url) {
      errors.push(`Reference missing "title" or "url".`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the curriculum index file
 * @param {Object} index
 * @returns {ValidationResult}
 */
export function validateCurriculumIndex(index) {
  const errors = [];

  if (!index || typeof index !== 'object') {
    return { valid: false, errors: ['Curriculum index is not a valid object.'] };
  }

  if (!Array.isArray(index.curricula)) {
    errors.push('Curriculum index must contain a "curricula" array.');
    return { valid: false, errors };
  }

  for (const entry of index.curricula) {
    if (!entry.id || !entry.title || !entry.file) {
      errors.push(`Curriculum index entry missing required fields: ${JSON.stringify(entry)}`);
    }
  }

  return { valid: errors.length === 0, errors };
}