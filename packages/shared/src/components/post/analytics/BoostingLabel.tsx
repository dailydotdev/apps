import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

export const BoostingLabel = () => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Footnote}
    color={TypographyColor.Boost}
    className="rounded-6 bg-action-comment-float px-1 py-px"
  >
    Boosting
  </Typography>
);
