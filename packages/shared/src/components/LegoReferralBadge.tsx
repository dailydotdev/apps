import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReferralOriginKey } from '../graphql/users';
import { useReferralCampaign } from '../hooks';
import { Image } from './image/Image';
import { FlexRow } from './utilities';
import { useActions } from '../hooks/useActions';
import { ActionType } from '../graphql/actions';

type LegoReferralBadgeProps = {
  className?: string;
  referralTargetCount: number;
};

const LegoReferralBadge = ({
  className,
  referralTargetCount,
}: LegoReferralBadgeProps): ReactElement => {
  const { checkHasCompleted } = useActions();
  const { referredUsersCount, isLoading } = useReferralCampaign({
    referralOrigin: ReferralOriginKey.LegoMay2023,
  });
  const referralCurrentCount =
    referredUsersCount > referralTargetCount
      ? referralTargetCount
      : referredUsersCount;

  if (checkHasCompleted(ActionType.LegoMay2023Hide)) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <button
      type="button"
      className={classNames(
        className,
        'rounded-12 p-[3px] bg-gradient-to-br from-[#6DE8BE] via-[#DD3DFC] to-[#F9DD53]',
      )}
    >
      <FlexRow className="gap-1.5 justify-center items-center py-1 px-3 font-bold rounded-10 bg-theme-bg-primary typo-callout text-theme-label-tertiary">
        {referralCurrentCount}/{referralTargetCount}
        {/* TODO WT-1415-referral-cta-in-header upload to cloudinary and remove file from public */}
        <Image width={33} height={29} src="/lego-piece.svg" />
      </FlexRow>
    </button>
  );
};

export default LegoReferralBadge;
