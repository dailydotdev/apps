import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { IconSize } from '../../../components/Icon';
import { MoveToIcon } from '../../../components/icons';
import Logo, { LogoPosition } from '../../../components/Logo';

interface ProgressBarProps {
  currentChapter: number;
  currentStep: number;
  chapters: { steps: number }[];
  className?: string;
}

function ProgressBar({
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
            <div className="relative h-full w-full overflow-hidden rounded-50 bg-background-subtle">
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

export interface HeaderProps extends ProgressBarProps {
  showBackButton?: boolean;
  showSkipButton?: boolean;
  showProgressBar?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function Header({
  currentChapter,
  currentStep,
  chapters,
  showBackButton,
  showSkipButton,
  showProgressBar,
  onBack,
  onSkip,
  className,
}: HeaderProps): ReactElement {
  const isFirstStep = currentChapter === 0 && currentStep === 0;

  return (
    <div className={classNames('flex flex-col', className)}>
      <div className="relative mx-1 flex h-14 items-center">
        {showBackButton && !isFirstStep && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Large}
            onClick={onBack}
            icon={<MoveToIcon size={IconSize.Small} className="rotate-180" />}
            aria-label="Go back"
          />
        )}

        <Logo
          position={LogoPosition.Empty}
          linkDisabled
          className="absolute inset-0 m-auto h-fit w-fit"
        />

        {showSkipButton && (
          <Button
            className="ml-auto"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Large}
            onClick={onSkip}
          >
            Skip
          </Button>
        )}
      </div>

      {showProgressBar && (
        <ProgressBar
          currentChapter={currentChapter}
          chapters={chapters}
          currentStep={currentStep}
        />
      )}
    </div>
  );
}
