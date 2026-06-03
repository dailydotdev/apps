import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
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
import { useGivebackContext } from '../GivebackContext';

const GOAL_PRESETS = [0, 25, 50, 99, 100];
const LEVEL_PRESETS = [1, 2, 3, 4, 5];

// Minimal Phase 1 review control so design can preview goal % and level states.
// The full QA/dev testing panel (all action/cause/geo/reward states) lands later.
export const GivebackReviewToggle = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);
  const { goalPercentage, setGoalPercentage, userLevel, setUserLevel } =
    useGivebackContext();

  return (
    <FlexCol className="fixed bottom-4 right-4 z-modal max-w-64 gap-3 rounded-16 border border-border-subtlest-secondary bg-background-popover p-4 shadow-2">
      <FlexRow className="items-center justify-between gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
        >
          Giveback preview
        </Typography>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Subtle}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </FlexRow>

      {isOpen && (
        <>
          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Community goal
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {GOAL_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    goalPercentage === preset
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setGoalPercentage(preset)}
                  className={classNames('min-w-12')}
                >
                  {preset}%
                </Button>
              ))}
            </FlexRow>
          </FlexCol>

          <FlexCol className="gap-1.5">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Your level
            </Typography>
            <FlexRow className="flex-wrap gap-1">
              {LEVEL_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={
                    userLevel === preset
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => setUserLevel(preset)}
                >
                  {preset}
                </Button>
              ))}
            </FlexRow>
          </FlexCol>
        </>
      )}
    </FlexCol>
  );
};
