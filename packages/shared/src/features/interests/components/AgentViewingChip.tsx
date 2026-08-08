import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';

export const AgentViewingChip = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center gap-1 rounded-8 bg-surface-secondary px-2 py-0.5',
      className,
    )}
  >
    <span className="size-1.5 rounded-6 bg-surface-invert" />
    {/* surface-invert flips with the chip's surface-secondary background, so
        the label stays dark on the light chip in dark mode and vice versa. */}
    <Typography
      type={TypographyType.Caption2}
      className="text-surface-invert"
      bold
    >
      Viewing
    </Typography>
  </span>
);
