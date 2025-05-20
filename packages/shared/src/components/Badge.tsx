import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from './typography/Typography';

type BadgeProps = {
  icon?: ReactNode;
  label: string;
  variant: 'primary' | 'onion';
};

const variantToClassName = {
  primary: 'border-border-subtlest-secondary text-surface-primary',
  onion: 'border-overlays-secondary-onion text-accent-onion-subtler',
};

export const Badge = ({ label, icon, variant }: BadgeProps) => {
  return (
    <div
      className={classNames(
        variantToClassName[variant],
        'flex items-center gap-1 rounded-20 border px-3 py-2',
      )}
    >
      {icon}
      <Typography type={TypographyType.Body} bold tag={TypographyTag.P}>
        {label}
      </Typography>
    </div>
  );
};
