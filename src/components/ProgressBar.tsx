import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { useRoadmap } from '../hooks/useRoadmap';

interface ProgressBarProps {
  moduleId?: string;
  lessonIds?: string[];
  showLabel?: boolean;
}

export function ProgressBar({ moduleId, lessonIds, showLabel = true }: ProgressBarProps) {
  const { progress } = useProgress();
  const { totalLessons } = useRoadmap();

  let percentage: number;
  let label: string;

  if (moduleId && lessonIds) {
    const completed = lessonIds.filter(id => progress.completedLessons.includes(id)).length;
    percentage = lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0;
    label = `${completed}/${lessonIds.length} aulas`;
  } else {
    percentage = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
    label = `${progress.completedLessons.length}/${totalLessons} aulas concluídas`;
  }

  return (
    <div className="progress-bar-container" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      {showLabel && <span className="progress-label">{label}</span>}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="progress-percentage" aria-hidden="true">{percentage}%</span>
    </div>
  );
}
