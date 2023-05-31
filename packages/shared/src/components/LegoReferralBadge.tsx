import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReferralOriginKey } from '../graphql/users';
import { useReferralCampaign } from '../hooks';
import { Button } from './buttons/Button';
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
    <Button
      className={classNames(
        className,
        // TODO WT-1415-referral-cta-in-header correct border color
        'border-theme-color-lettuce border-[3px] rounded-12 px-3 typo-callout text-theme-label-tertiary',
      )}
    >
      <FlexRow className="gap-1.5 justify-center items-center">
        {referralCurrentCount}/{referralTargetCount}
        {/* TODO WT-1415-referral-cta-in-header upload to cloudinary and remove file from public */}
        <Image width={33} height={29} src="/lego-piece.svg" />
      </FlexRow>
    </Button>
  );
};

export default LegoReferralBadge;
