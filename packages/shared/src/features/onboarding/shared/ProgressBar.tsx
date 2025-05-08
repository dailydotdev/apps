import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export interface ProgressBarProps {
  currentChapter: number;
  currentStep: number;
  chapters: { steps: number }[];
  className?: string;
}

export function ProgressBar({
  currentChapter,
  currentStep,
  chapters,
  className,
}: ProgressBarProps): ReactElement {
  const currentChapterSteps = chapters[currentChapter]?.steps || 1;
  const progressPercentage = (currentStep / currentChapterSteps) * 100;

  return (
    <div
      className={classNames('mt-2 flex h-1 w-full gap-2 px-4', className)}
      data-testid="progress-bar-container"
    >
      {chapters.map((_, index) => {
        const isCurrentChapter = index === currentChapter;
        const isPastChapter = index < currentChapter;

        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-1 flex-1 rounded-50"
            data-testid="progress-bar-chapter"
          >
            <div className="relative h-full w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
              {(isPastChapter || isCurrentChapter) && (
                <div
                  className="transition-width absolute inset-0 rounded-50 bg-accent-cabbage-default duration-300 ease-in-out"
                  style={{
                    width: `${isCurrentChapter ? progressPercentage : 100}%`,
                  }}
                  data-testid={
                    isPastChapter
                      ? 'progress-bar-complete'
                      : 'progress-bar-current'
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
