import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../components/typography/Typography';

export function BoostHistoryLoading(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4">
      <Typography type={TypographyType.Title3} color={TypographyColor.Tertiary}>
        Fetching campaigns...
      </Typography>
    </div>
  );
}
