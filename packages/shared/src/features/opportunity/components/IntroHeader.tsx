import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DailyIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { briefButtonBg } from '../../../styles/custom';

export const IntroHeader = (): ReactElement => {
  return (
    <FlexCol className="items-center gap-2">
      <FlexRow className="items-center gap-1">
        <DailyIcon />{' '}
        <Typography
          center
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Career mode unlocked (beta)
        </Typography>
      </FlexRow>
      <Typography
        center
        type={TypographyType.LargeTitle}
        bold
        style={{
          background: briefButtonBg,
        }}
        className="!bg-clip-text text-transparent"
      >
        Welcome to a new hiring experience that respects your time, privacy, and
        intelligence
      </Typography>
    </FlexCol>
  );
};
