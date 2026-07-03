import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface GivebackTabHeadingProps {
  title: ReactNode;
  description?: ReactNode;
}

// One shared header for every onboarded tab (Take action / Your impact / Causes
// / FAQ) so the title and subtitle always share the exact same size, color, gap
// and width. Keeping this in one place stops the per-tab styling from drifting.
export const GivebackTabHeading = ({
  title,
  description,
}: GivebackTabHeadingProps): ReactElement => (
  <FlexCol className="gap-2">
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Title2}
      bold
      className="max-w-2xl [text-wrap:balance]"
    >
      {title}
    </Typography>
    {description != null && (
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-2xl [text-wrap:pretty]"
      >
        {description}
      </Typography>
    )}
  </FlexCol>
);
