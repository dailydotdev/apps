import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

/**
 * Shared heading for the redesigned recommend module, so the desktop
 * (`ShareBar`) and mobile (`ShareMobile`) widgets read as the same module.
 * Reframes the old yes/no question ("Would you recommend this post?") as a
 * reason to act.
 */
export const ShareModuleHeader = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-0.5', className)}>
    <Typography bold tag={TypographyTag.H4} type={TypographyType.Callout}>
      Know someone who should read this?
    </Typography>
    <Typography color={TypographyColor.Tertiary} type={TypographyType.Footnote}>
      One link is all it takes — it is how most posts on daily.dev reach their
      next reader.
    </Typography>
  </div>
);
