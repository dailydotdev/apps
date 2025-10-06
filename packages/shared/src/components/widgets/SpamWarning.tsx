import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import { InfoIcon } from '../icons';

type SpamWarningProps = {
  content: string;
};

const SpamWarning = ({ content }: SpamWarningProps) => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    className="flex gap-1"
  >
    <InfoIcon
      className="text-status-warning"
      secondary
      size={IconSize.Size16}
    />{' '}
    {content}
  </Typography>
);
export default SpamWarning;
