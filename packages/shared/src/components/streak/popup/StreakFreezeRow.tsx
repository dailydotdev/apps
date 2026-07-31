import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useReadingStreak } from '../../../hooks/streaks/useReadingStreak';
import { useStreakFreeze } from '../../../hooks/streaks/useStreakFreeze';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureStreakFreeze } from '../../../lib/featureManagement';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

// `popup` is the production ReadingStreakPopup row and must stay as it is: the
// whole row is the button, so the only affordance is the row itself. `panel` is
// the v2 sidebar's, which is framed by its own inset separators (hence no top
// border) and follows the panel guidelines — title, subtitle, neutral button.
type StreakFreezeRowVariant = 'popup' | 'panel';

interface StreakFreezeRowProps {
  variant?: StreakFreezeRowVariant;
}

export function StreakFreezeRow({
  variant = 'popup',
}: StreakFreezeRowProps = {}): ReactElement | null {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { isStreaksEnabled } = useReadingStreak();
  const hasAccessToCores = useHasAccessToCores();
  const shouldEvaluate = isAuthReady && isLoggedIn && isStreaksEnabled;
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate,
  });
  const { openModal } = useLazyModal();
  const isEnabled = shouldEvaluate && isStreakFreezeEnabled && hasAccessToCores;
  const { freezesAvailable } = useStreakFreeze({ enabled: isEnabled });

  if (!isEnabled) {
    return null;
  }

  const hasFreezes = freezesAvailable > 0;
  const openPurchase = () =>
    openModal({ type: LazyModal.StreakFreezePurchase });
  const balanceLabel = `${freezesAvailable} streak freeze${
    freezesAvailable === 1 ? '' : 's'
  } left`;
  const ctaLabel = hasFreezes ? 'Buy more' : 'Buy freezes';

  if (variant === 'popup') {
    return (
      <button
        type="button"
        className="mt-3 flex w-full items-center gap-2 border-t border-border-subtlest-tertiary px-4 py-3 text-left"
        onClick={openPurchase}
      >
        <Typography
          className="flex-1"
          type={TypographyType.Callout}
          color={
            hasFreezes ? TypographyColor.Primary : TypographyColor.Tertiary
          }
          bold={!hasFreezes}
        >
          {hasFreezes ? (
            balanceLabel
          ) : (
            <>
              No freezes left
              <br />
              Protect your streak
            </>
          )}
        </Typography>
        <Typography type={TypographyType.Footnote} color={TypographyColor.Link}>
          {ctaLabel}
        </Typography>
      </button>
    );
  }

  return (
    <div className="flex w-full items-center gap-2 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
        >
          {hasFreezes ? balanceLabel : 'No freezes left'}
        </Typography>
        {!hasFreezes && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Protect your streak
          </Typography>
        )}
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.XSmall}
        onClick={openPurchase}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
