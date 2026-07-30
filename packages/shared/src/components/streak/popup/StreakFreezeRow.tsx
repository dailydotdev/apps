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

export function StreakFreezeRow(): ReactElement | null {
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

  return (
    <div className="mt-3 flex w-full items-center gap-2 border-t border-border-subtlest-tertiary px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
        >
          {hasFreezes
            ? `${freezesAvailable} streak freeze${
                freezesAvailable === 1 ? '' : 's'
              } left`
            : 'No freezes left'}
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
        onClick={() => openModal({ type: LazyModal.StreakFreezePurchase })}
      >
        {hasFreezes ? 'Buy more' : 'Buy freezes'}
      </Button>
    </div>
  );
}
