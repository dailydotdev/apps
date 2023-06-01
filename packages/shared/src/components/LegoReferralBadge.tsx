import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReferralCampaignKey, useReferralCampaign } from '../hooks';
import { Image } from './image/Image';
import { FlexRow } from './utilities';
import { useActions } from '../hooks/useActions';
import { ActionType } from '../graphql/actions';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { cloudinary } from '../lib/image';

type LegoReferralBadgeProps = {
  className?: string;
  campaignKey: ReferralCampaignKey;
};

const LegoReferralBadge = ({
  className,
  campaignKey,
}: LegoReferralBadgeProps): ReactElement => {
  const { checkHasCompleted } = useActions();
  const { isReady, referralCurrentCount, referralTargetCount } =
    useReferralCampaign({
      campaignKey,
    });
  const { openModal } = useLazyModal();

  if (checkHasCompleted(ActionType.LegoMay2023Hide)) {
    return null;
  }

  if (!isReady) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        className,
        'rounded-12 p-[3px] bg-gradient-to-br from-[#6DE8BE] via-[#DD3DFC] to-[#F9DD53]',
      )}
      onClick={() => {
        openModal({
          type: LazyModal.LegoReferralCampaign,
          props: {
            campaignKey,
          },
        });
      }}
    >
      <FlexRow className="gap-1.5 justify-center items-center py-1 px-3 font-bold rounded-10 bg-theme-bg-primary typo-callout text-theme-label-tertiary">
        {referralCurrentCount}/{referralTargetCount}
        <Image
          width={33}
          height={29}
          src={cloudinary.referralCampaign.lego.piece}
        />
      </FlexRow>
    </button>
  );
};

export default LegoReferralBadge;
