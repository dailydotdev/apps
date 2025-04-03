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
import { ProgressBar } from './ProgressBar';
import type { ProgressBarProps } from './ProgressBar';

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
            className="ml-auto font-normal"
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
