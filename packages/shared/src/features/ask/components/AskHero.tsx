import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DailyIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { useIsLightTheme } from '../../../hooks/utils';
import { briefButtonBg } from '../../../styles/custom';

interface AskHeroProps {
  onLearnClick: () => void;
  onDevClick: () => void;
}

export const AskHero = ({
  onLearnClick,
  onDevClick,
}: AskHeroProps): ReactElement => {
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
          daily.dev Ask
        </Typography>
      </FlexRow>
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
        Your agent already searches the web. Teach it to search like a senior
        dev.
      </Typography>
      <Typography
        center
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="max-w-lg"
      >
        Give your coding tools access to articles read and upvoted by real
        developers, instead of random web results.
      </Typography>
      <FlexRow className="mt-2 flex-wrap justify-center gap-3">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={onLearnClick}
        >
          I&apos;m learning to code
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Large}
          onClick={onDevClick}
        >
          I&apos;m already* developer
        </Button>
      </FlexRow>
    </FlexCol>
  );
};
