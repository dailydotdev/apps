import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import type { UseCompanionBrowsingConsentReturn } from '@dailydotdev/shared/src/hooks/useCompanionBrowsingConsent';

type CompanionBrowsingConsentBannerProps = Pick<
  UseCompanionBrowsingConsentReturn,
  'onAccept' | 'onDismiss'
>;

export function CompanionBrowsingConsentBanner({
  onAccept,
  onDismiss,
}: CompanionBrowsingConsentBannerProps): ReactElement {
  return (
    <div className="relative mb-4 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-1 top-1"
        onClick={onDismiss}
      />
      <p className="pr-6 font-bold typo-callout">
        Personalize with browsing context?
      </p>
      <p className="mt-1 text-text-tertiary typo-footnote">
        Allow daily.dev to use your browsing context for more relevant
        recommendations. Change anytime in settings.
      </p>
      <div className="mt-3 flex gap-3">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={onAccept}
        >
          Allow
        </Button>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          onClick={onDismiss}
        >
          No thanks
        </Button>
      </div>
    </div>
  );
}
