import { useMemo } from 'react';
import { roadmapModules } from '../data/roadmap';

export function useRoadmap() {
  const totalLessons = useMemo(
    () => roadmapModules.reduce((acc, m) => acc + m.lessons.length, 0),
    []
  );

  const findLesson = (lessonId: string) => {
    for (const module of roadmapModules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) return { module, lesson };
    }
    return null;
  };

  const findModule = (moduleId: string) => {
    return roadmapModules.find(m => m.id === moduleId) ?? null;
  };

  const getNextLesson = (currentLessonId: string) => {
    for (let mi = 0; mi < roadmapModules.length; mi++) {
      const mod = roadmapModules[mi];
      const li = mod.lessons.findIndex(l => l.id === currentLessonId);
      if (li !== -1) {
        if (li < mod.lessons.length - 1) {
          return mod.lessons[li + 1];
        }
        if (mi < roadmapModules.length - 1) {
          return roadmapModules[mi + 1].lessons[0];
        }
      }
    }
    return null;
  };

  const getPrevLesson = (currentLessonId: string) => {
    for (let mi = 0; mi < roadmapModules.length; mi++) {
      const mod = roadmapModules[mi];
      const li = mod.lessons.findIndex(l => l.id === currentLessonId);
      if (li !== -1) {
        if (li > 0) {
          return mod.lessons[li - 1];
        }
        if (mi > 0) {
          const prevMod = roadmapModules[mi - 1];
          return prevMod.lessons[prevMod.lessons.length - 1];
        }
      }
    }
    return null;
  };

  return { modules: roadmapModules, totalLessons, findLesson, findModule, getNextLesson, getPrevLesson };
}
