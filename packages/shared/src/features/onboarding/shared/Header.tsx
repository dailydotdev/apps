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
import { FunnelTargetId } from '../types/funnelEvents';

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
            aria-label="Go back"
            data-funnel-track={FunnelTargetId.StepBack}
            icon={<MoveToIcon size={IconSize.Small} className="rotate-180" />}
            onClick={onBack}
            size={ButtonSize.Large}
            variant={ButtonVariant.Tertiary}
          />
        )}

        <Logo
          className="absolute inset-0 m-auto h-fit w-fit"
          linkDisabled
          position={LogoPosition.Empty}
        />

        {showSkipButton && (
          <Button
            className="ml-auto font-normal"
            data-funnel-track={FunnelTargetId.StepSkip}
            onClick={onSkip}
            size={ButtonSize.Large}
            variant={ButtonVariant.Tertiary}
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
