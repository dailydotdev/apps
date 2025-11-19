import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { VIcon } from '../icons';
import classed from '../../lib/classed';
import classNames from 'classnames';

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

export const RecruiterProgress = () => (
  <div className="flex flex-row gap-4 border-b border-border-subtlest-tertiary">
    <ProgressItem icon={<VIcon />} title="Analyze & Match" active />
    <ProgressItem
      className="border-x border-border-subtlest-tertiary"
      icon={<p>2</p>}
      title="Prepare & Launch"
      active
    />
    <ProgressItem icon={<p>2</p>} title="Connect & Hire" />
  </div>
);
