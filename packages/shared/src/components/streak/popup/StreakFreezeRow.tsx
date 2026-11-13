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

/**
 * Freezes are on for this reader: streaks, and either the flag with Cores
 * access or freezes already held (e.g. the free ones from
 * streak_free_freezes), which the API applies without Cores access. Buying
 * more still needs Cores access, see useHasAccessToCores.
 */
export const useIsStreakFreezeEnabled = (): boolean => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { isStreaksEnabled, streak } = useReadingStreak();
  const hasAccessToCores = useHasAccessToCores();
  const shouldEvaluate = isAuthReady && isLoggedIn && isStreaksEnabled;
  const holdsFreezes = (streak?.freezesAvailable ?? 0) > 0;
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate: shouldEvaluate && hasAccessToCores,
  });

  return (
    shouldEvaluate &&
    (holdsFreezes || (isStreakFreezeEnabled && hasAccessToCores))
  );
};

export function StreakFreezeRow({
  variant = 'popup',
}: StreakFreezeRowProps = {}): ReactElement | null {
  const isEnabled = useIsStreakFreezeEnabled();
  const canBuy = useHasAccessToCores();
  const { openModal } = useLazyModal();
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
    // Without Cores access the freezes held are only shown, not sold
    const RowTag = canBuy ? 'button' : 'div';

    return (
      <RowTag
        {...(canBuy && { type: 'button' as const, onClick: openPurchase })}
        className="mt-3 flex w-full items-center gap-2 border-t border-border-subtlest-tertiary px-4 py-3 text-left"
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
        {canBuy && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Link}
          >
            {ctaLabel}
          </Typography>
        )}
      </RowTag>
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
      {canBuy && (
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.XSmall}
          onClick={openPurchase}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
