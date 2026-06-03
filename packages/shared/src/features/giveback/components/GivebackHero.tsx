import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { DailyIcon, StarIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonVariant,
  ButtonSize,
} from '../../../components/buttons/Button';
import { useGivebackContext } from '../GivebackContext';

export const GivebackHero = (): ReactElement => {
  const { campaign } = useGivebackContext();

  return (
    <FlexCol className="relative w-full items-center gap-4 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float px-4 py-10 text-center tablet:px-10 tablet:py-14">
      <div
        aria-hidden
        className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-24 -top-24 size-64 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-accent-onion-default/15 pointer-events-none absolute -right-24 -top-10 size-56 rounded-full blur-3xl"
      />
      <FlexRow className="relative items-center gap-1.5">
        <DailyIcon />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          daily.dev Giveback
        </Typography>
      </FlexRow>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="relative max-w-2xl bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text text-transparent"
      >
        Help us grow. We&apos;ll fund good causes.
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
        className="relative max-w-xl"
      >
        {campaign.heroCopy}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        color={TypographyColor.Tertiary}
        className="relative max-w-xl"
      >
        Complete community actions to help unlock donation value. When the
        community hits the goal, daily.dev donates to causes you choose.
      </Typography>
      <Button
        tag="a"
        href="#giveback-roadmap"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        icon={<StarIcon />}
        className="relative mt-2"
      >
        See your roadmap
      </Button>
    </FlexCol>
  );
};
