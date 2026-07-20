import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DailyIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useIsLightTheme } from '../../../hooks/utils';
import { briefButtonBg } from '../../../styles/custom';
import { fromCDN } from '../../../lib/links';
import { HackathonSignupButton } from './HackathonSignupButton';

export const HackathonHero = (): ReactElement => {
  const isLightTheme = useIsLightTheme();

  return (
    <FlexCol className="items-center gap-4">
      <FlexRow className="items-center gap-1">
        <DailyIcon />
        <Typography
          center
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          daily.dev Hackathon
        </Typography>
      </FlexRow>
      <img
        src={fromCDN('/app/assets/hackathon-og.png?v=3')}
        alt="daily.dev Hackathon"
        className="w-full max-w-2xl rounded-16"
      />
      <Typography
        center
        type={TypographyType.LargeTitle}
        bold
        style={isLightTheme ? undefined : { background: briefButtonBg }}
        className={
          isLightTheme
            ? 'text-accent-onion-default'
            : '!bg-clip-text text-transparent'
        }
      >
        Build something for developers, from developers.
      </Typography>
      <Typography center type={TypographyType.Title3} bold>
        Starts May 20th, 12:00 UTC
      </Typography>
      <Typography
        center
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="max-w-lg"
      >
        5 days, three tracks, full access to the daily.dev Public API. Work on
        it at your own pace. <strong>Win 1 year of daily.dev Plus!</strong>
      </Typography>
      <FlexRow className="mt-2 flex-wrap items-center justify-center gap-3">
        <HackathonSignupButton />
      </FlexRow>
    </FlexCol>
  );
};
