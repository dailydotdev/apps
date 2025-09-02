import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

export const BoostingLabel = () => (
  <Typography
    tag={TypographyTag.Span}
    type={TypographyType.Footnote}
    className="rounded-6 bg-action-comment-float px-1 py-px text-action-comment-default"
  >
    Boosting
  </Typography>
);
