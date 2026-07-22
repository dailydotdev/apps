import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureStreakFreeze } from '../../lib/featureManagement';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';

interface StreakFreezeUpsellProps {
  children: ReactNode;
  className?: string;
}

export function StreakFreezeUpsell({
  children,
  className,
}: StreakFreezeUpsellProps): ReactElement | null {
  const hasAccessToCores = useHasAccessToCores();
  const { value: isStreakFreezeEnabled } = useConditionalFeature({
    feature: featureStreakFreeze,
    shouldEvaluate: hasAccessToCores,
  });
  const { openModal } = useLazyModal();

  if (!hasAccessToCores || !isStreakFreezeEnabled) {
    return null;
  }

  return (
    <ClickableText
      className={classNames('justify-center text-center', className)}
      textClassName="typo-footnote"
      onClick={() => openModal({ type: LazyModal.StreakFreezePurchase })}
    >
      {children}
    </ClickableText>
  );
}
