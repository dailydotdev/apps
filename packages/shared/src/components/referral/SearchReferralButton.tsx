import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReferralCampaignKey, useReferralCampaign } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import { LazyModal } from '../modals/common/types';
import { CampaignCtaPlacement } from '../../graphql/settings';

interface SearchReferralButtonProps {
  className?: string;
}

export function SearchReferralButton({
  className,
}: SearchReferralButtonProps): ReactElement {
  const { openModal } = useLazyModal();
  const { campaignCtaPlacement } = useSettingsContext();
  const { isReady, referralCurrentCount, referralTargetCount } =
    useReferralCampaign({
      campaignKey: ReferralCampaignKey.Search,
    });

  if (campaignCtaPlacement !== CampaignCtaPlacement.Header || !isReady) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        'flex flex-row items-center justify-center rounded-12 py-1 px-3 font-bold text-theme-label-tertiary bg-theme-overlay-from',
        className,
      )}
      onClick={() => openModal({ type: LazyModal.SearchReferral })}
    >
      {referralCurrentCount}/{referralTargetCount}
      <Image
        className="mt-1 ml-3"
        width={24}
        height={24}
        src={cloudinary.referralCampaign.key}
      />
    </button>
  );
}
