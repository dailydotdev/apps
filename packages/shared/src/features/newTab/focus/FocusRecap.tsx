import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface FocusRecapProps {
  durationMinutes: number;
  onDismiss: () => void;
}

// Final state after the countdown hits zero. Intentionally minimal: we
// celebrate the completion, show the session length, and give one clear
// action to exit. Phase 3 adds streak/history context here.
export const FocusRecap = ({
  durationMinutes,
  onDismiss,
}: FocusRecapProps): ReactElement => {
  return (
    <section
      aria-label="Focus session complete"
      className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 pb-16 pt-16 tablet:pt-24"
    >
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="text-center"
      >
        Nice work.
      </Typography>
      <Typography
        type={TypographyType.Title3}
        color={TypographyColor.Tertiary}
        className="text-balance text-center"
      >
        You just focused for {durationMinutes} minutes. Step away, stretch,
        hydrate — whatever feels good. Your feed will be here when you&apos;re
        ready.
      </Typography>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        onClick={onDismiss}
      >
        Done
      </Button>
    </section>
  );
};
