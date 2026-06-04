import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MoveToIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useGivebackNav } from '../GivebackNavContext';

// Hero gateway: one clear decision above the fold — "do you want to join?".
// Picking causes and taking actions happens after opting in, so the hero stays
// focused and easy to consume.
export const GivebackStartPanel = (): ReactElement => {
  const { start } = useGivebackNav();

  return (
    <FlexCol className="gap-4">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        Take small actions and we turn them into{' '}
        <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
          real donations
        </span>
        . daily.dev funds every cent — you never pay.
      </Typography>

      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        icon={<MoveToIcon size={IconSize.Small} />}
        iconPosition={ButtonIconPosition.Right}
        onClick={start}
        className="shadow-2-cabbage transition-transform duration-200 ease-out hover:scale-[1.02]"
      >
        Join the campaign
      </Button>
    </FlexCol>
  );
};
