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
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';

interface SearchReferralButtonProps {
  className?: string;
}

export function SearchReferralButton({
  className,
}: SearchReferralButtonProps): ReactElement {
  const { openModal } = useLazyModal();
  const { trackEvent } = useAnalyticsContext();
  const { campaignCtaPlacement } = useSettingsContext();
  const { isReady, availableCount } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Search,
  });
  const shouldBeDisplayed =
    campaignCtaPlacement === CampaignCtaPlacement.Header && isReady;
  const handleClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.Click,
      target_type: TargetType.SearchInviteButton,
      target_id: TargetId.SearchReferralBadge,
    });
    openModal({ type: LazyModal.SearchReferral });
  };

  if (!shouldBeDisplayed) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex flex-row items-center justify-center typo-callout rounded-12 py-1 px-3 font-bold text-theme-label-tertiary bg-theme-overlay-from',
        className,
      )}
      onClick={handleClick}
    >
      {availableCount}
      <KeyReferralIcon size={IconSize.Medium} className="mt-1 ml-1" />
    </button>
  );
}
