import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReferralCampaignKey, useReferralCampaign } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { LazyModal } from '../modals/common/types';
import { CampaignCtaPlacement } from '../../graphql/settings';
import { KeyReferralIcon } from '../icons';
import { IconSize } from '../Icon';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';

interface SearchReferralButtonProps {
  className?: string;
}

export function SearchReferralButton({
  className,
}: SearchReferralButtonProps): ReactElement {
  const { openModal } = useLazyModal();
  const { trackEvent } = useAnalyticsContext();
  const { campaignCtaPlacement } = useSettingsContext();
  const { isReady, copy } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Search,
  });
  const shouldBeDisplayed =
    campaignCtaPlacement === CampaignCtaPlacement.Header && isReady;
  const handleClick = () => {
    trackEvent({ event_name: AnalyticsEvent.Click });
    openModal({ type: LazyModal.SearchReferral });
  };

  if (!shouldBeDisplayed) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex flex-row items-center justify-center rounded-12 py-1 px-3 font-bold text-theme-label-tertiary bg-theme-overlay-from',
        className,
      )}
      onClick={handleClick}
    >
      {copy.count}/{copy.limit}
      <KeyReferralIcon size={IconSize.Medium} className="mt-1 ml-3" />
    </button>
  );
}
