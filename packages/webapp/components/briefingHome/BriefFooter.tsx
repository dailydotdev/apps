import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

const dayOfYear = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const BriefFooter = (): ReactElement => (
  <footer className="mt-16 flex items-center justify-between border-t border-border-subtlest-tertiary pt-4">
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
      className="uppercase tracking-[0.16em]"
    >
      Edition #{dayOfYear()}
    </Typography>
    <Typography
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
      className="uppercase tracking-[0.16em]"
    >
      daily.dev · brief
    </Typography>
  </footer>
);
