// Progress tracking helpers

import * as state from './state.js';
import { saveCompletedLessons, saveCompletedModules } from './storage.js';

/**
 * Mark a lesson as complete and check if its module is also complete
 * @param {string} lessonId
 */
export async function completeLesson(lessonId) {
  state.markLessonComplete(lessonId);
  await saveCompletedLessons(state.getCompletedLessonIds());

  // Check if the parent module is now fully complete
  const lookups = state.getLookups();
  const lesson = lookups.lessonsById[lessonId];
  if (!lesson) return;

  const moduleLessons = lookups.lessonsByModule[lesson.moduleId] || [];
  const allComplete = moduleLessons.every(l => state.isLessonComplete(l.id));

  if (allComplete && !state.isModuleComplete(lesson.moduleId)) {
    state.markModuleComplete(lesson.moduleId);
    await saveCompletedModules(state.getCompletedModuleIds());
  }
}

/**
 * Get progress summary for a track
 * @param {string} trackId
 * @returns {{ totalLessons: number, completedLessons: number, totalModules: number, completedModules: number, percentage: number }}
 */
export function getTrackProgress(trackId) {
  const lookups = state.getLookups();
  const modules = lookups.modulesByTrack[trackId] || [];
  let totalLessons = 0;
  let completedLessons = 0;

  for (const mod of modules) {
    const lessons = lookups.lessonsByModule[mod.id] || [];
    totalLessons += lessons.length;
    completedLessons += lessons.filter(l => state.isLessonComplete(l.id)).length;
  }

  const totalModules = modules.length;
  const completedModules = modules.filter(m => state.isModuleComplete(m.id)).length;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return { totalLessons, completedLessons, totalModules, completedModules, percentage };
}

/**
 * Get progress summary for a module
 * @param {string} moduleId
 * @returns {{ totalLessons: number, completedLessons: number, percentage: number }}
 */
export function getModuleProgress(moduleId) {
  const lookups = state.getLookups();
  const lessons = lookups.lessonsByModule[moduleId] || [];
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => state.isLessonComplete(l.id)).length;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return { totalLessons, completedLessons, percentage };
}

/**
 * Get overall curriculum progress
 * @returns {{ totalLessons: number, completedLessons: number, totalModules: number, completedModules: number, percentage: number }}
 */
export function getOverallProgress() {
  const curriculum = state.getCurriculum();
  if (!curriculum) return { totalLessons: 0, completedLessons: 0, totalModules: 0, completedModules: 0, percentage: 0 };

  const totalLessons = curriculum.lessons.length;
  const completedLessons = curriculum.lessons.filter(l => state.isLessonComplete(l.id)).length;
  const totalModules = curriculum.modules.length;
  const completedModules = curriculum.modules.filter(m => state.isModuleComplete(m.id)).length;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return { totalLessons, completedLessons, totalModules, completedModules, percentage };
}