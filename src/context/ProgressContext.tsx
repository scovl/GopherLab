import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProgress, MesaPhase } from '../types';

interface ProgressContextType {
  progress: UserProgress;
  completeLesson: (lessonId: string) => void;
  uncompleteLesson: (lessonId: string) => void;
  setCurrentLesson: (lessonId: string | null) => void;
  setCurrentPhase: (phase: MesaPhase | null) => void;
  saveNote: (moduleId: string, note: string) => void;
  getModuleProgress: (moduleId: string, lessonIds: string[]) => number;
  isLessonCompleted: (lessonId: string) => boolean;
  totalCompleted: number;
  totalLessons: number;
}

const STORAGE_KEY = 'aprenda-go-progress';

const defaultProgress: UserProgress = {
  completedLessons: [],
  currentLesson: null,
  currentPhase: null,
  moduleNotes: {},
  startedAt: new Date().toISOString(),
  lastAccessedAt: new Date().toISOString(),
};

function loadProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { ...defaultProgress };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completeLesson = useCallback((lessonId: string) => {
    setProgress(prev => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        lastAccessedAt: new Date().toISOString(),
      };
    });
  }, []);

  const uncompleteLesson = useCallback((lessonId: string) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.filter(id => id !== lessonId),
      lastAccessedAt: new Date().toISOString(),
    }));
  }, []);

  const setCurrentLesson = useCallback((lessonId: string | null) => {
    setProgress(prev => ({
      ...prev,
      currentLesson: lessonId,
      currentPhase: lessonId ? 'modelagem' : null,
      lastAccessedAt: new Date().toISOString(),
    }));
  }, []);

  const setCurrentPhase = useCallback((phase: MesaPhase | null) => {
    setProgress(prev => ({ ...prev, currentPhase: phase }));
  }, []);

  const saveNote = useCallback((moduleId: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      moduleNotes: { ...prev.moduleNotes, [moduleId]: note },
    }));
  }, []);

  const getModuleProgress = useCallback(
    (moduleId: string, lessonIds: string[]) => {
      if (lessonIds.length === 0) return 0;
      const completed = lessonIds.filter(id => progress.completedLessons.includes(id)).length;
      return Math.round((completed / lessonIds.length) * 100);
    },
    [progress.completedLessons]
  );

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons]
  );

  const totalCompleted = progress.completedLessons.length;

  // Count total from roadmap — we'll pass this from App level
  const totalLessons = 0; // Will be computed by consumers

  const contextValue = useMemo(() => ({
    progress,
    completeLesson,
    uncompleteLesson,
    setCurrentLesson,
    setCurrentPhase,
    saveNote,
    getModuleProgress,
    isLessonCompleted,
    totalCompleted,
    totalLessons,
  }), [
    progress,
    completeLesson,
    uncompleteLesson,
    setCurrentLesson,
    setCurrentPhase,
    saveNote,
    getModuleProgress,
    isLessonCompleted,
    totalCompleted,
  ]);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}
