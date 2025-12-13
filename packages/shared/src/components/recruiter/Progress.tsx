import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { VIcon } from '../icons';
import classed from '../../lib/classed';

const ProgressItemIcon = classed(
  'div',
  'typo-caption2 rounded-8 flex items-center justify-center size-5',
);

type ProgressItemProps = {
  icon: ReactElement;
  title: string;
  active?: boolean;
  className?: string;
};

const ProgressItem = ({
  icon: Icon,
  title,
  active,
  className,
}: ProgressItemProps) => {
  return (
    <div
      className={classNames(
        'flex flex-1 items-center justify-center gap-2 p-2',
        active && 'text-brand-default',
        className,
      )}
    >
      <ProgressItemIcon
        className={
          active
            ? 'bg-brand-default font-bold text-surface-invert'
            : 'bg-surface-float text-text-tertiary'
        }
      >
        {Icon}
      </ProgressItemIcon>
      <Typography
        type={TypographyType.Caption2}
        color={active ? TypographyColor.Brand : TypographyColor.Tertiary}
      >
        {title}
      </Typography>
    </div>
  );
};

export enum RecruiterProgressStep {
  AnalyzeAndMatch = 1,
  PrepareAndLaunch = 2,
  ConnectAndHire = 3,
}

type RecruiterProgressProps = {
  activeStep: RecruiterProgressStep;
};

export const RecruiterProgress = ({ activeStep }: RecruiterProgressProps) => (
  <div className="flex flex-row gap-4 border-b border-border-subtlest-tertiary">
    <ProgressItem
      icon={<VIcon />}
      title="Analyze & Match"
      active={activeStep >= RecruiterProgressStep.AnalyzeAndMatch}
    />
    <ProgressItem
      className="border-x border-border-subtlest-tertiary"
      icon={<span>2</span>}
      title="Prepare & Launch"
      active={activeStep >= RecruiterProgressStep.PrepareAndLaunch}
    />
    <ProgressItem
      icon={<span>3</span>}
      title="Connect & Hire"
      active={activeStep >= RecruiterProgressStep.ConnectAndHire}
    />
  </div>
);
