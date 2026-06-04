import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SparkleIcon, StarIcon } from '../../../components/icons';
import { useGivebackNav } from '../GivebackNavContext';
import { GivebackTrustPerks } from './GivebackTrustPerks';

export const GivebackClosingCta = (): ReactElement => {
  const { setActiveTab } = useGivebackNav();

  return (
    <section className="relative w-full overflow-hidden border-t border-border-subtlest-tertiary pt-8">
      <div
        aria-hidden
        className="bg-accent-cabbage-default/15 pointer-events-none absolute left-1/2 top-0 size-[26rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <FlexCol className="relative items-center gap-5 py-8 text-center">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Ready when you are
        </Typography>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Mega2}
          bold
          className="max-w-3xl"
        >
          Turn everyday dev work into{' '}
          <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
            real-world impact
          </span>
          .
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          className="max-w-2xl"
        >
          You already do the work. We turn it into donations. You pay nothing.
        </Typography>
        <FlexRow className="flex-wrap justify-center gap-3 pt-1">
          <Button
            type="button"
            onClick={() => setActiveTab('actions')}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<StarIcon />}
          >
            Unlock impact
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab('impact')}
            variant={ButtonVariant.Float}
            size={ButtonSize.Large}
            icon={<SparkleIcon />}
          >
            See rewards
          </Button>
        </FlexRow>
        <GivebackTrustPerks className="justify-center pt-1" />
      </FlexCol>
    </section>
  );
};
