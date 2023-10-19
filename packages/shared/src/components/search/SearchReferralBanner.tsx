import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { KeyReferralIcon } from '../icons';
import { IconSize } from '../Icon';
import { ReferralCampaignKey, useReferralCampaign } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';

export function SearchReferralBanner(): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const { availableCount, noKeysAvailable, referralToken } =
    useReferralCampaign({
      campaignKey: ReferralCampaignKey.Search,
    });
  const { openModal } = useLazyModal();
  const handleBannerClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.Click,
      target_type: TargetType.SearchInviteButton,
      target_id: TargetId.InviteBanner,
    });
    openModal({ type: LazyModal.SearchReferral });
  };

  if (!referralToken) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 w-full rounded-14 bg-theme-overlay-from">
      <KeyReferralIcon size={IconSize.Large} className="mr-2" />
      <h2 className="font-bold typo-title2">
        {noKeysAvailable
          ? `Give more friends access to daily.dev's search!`
          : `Give your friends early access to daily.dev's search!`}
      </h2>
      <p className="typo-title3 text-theme-label-secondary">
        {noKeysAvailable
          ? `We noticed you have used all your invites wisely. Here's a way to get access to some more invites!`
          : `Be that cool friend who got access to yet another AI feature! You have ${availableCount} invites, use them wisely.`}
      </p>
      <Button className="btn-primary" onClick={handleBannerClick}>
        Give early access
      </Button>
    </div>
  );
}
