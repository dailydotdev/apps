import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { get as getCache, set as setCache } from 'idb-keyval';
import { ReferralCampaignKey, useReferralCampaign } from '../hooks';
import { Image } from './image/Image';
import { FlexRow } from './utilities';
import { useLazyModal } from '../hooks/useLazyModal';
import { LazyModal } from './modals/common/types';
import { cloudinary } from '../lib/image';
import usePersistentContext from '../hooks/usePersistentContext';
import {
  LEGO_REFERRAL_CAMPAIGN_MAY_2023_HIDDEN_FROM_HEADER_KEY,
  LEGO_REFERRAL_CAMPAIGN_MAY_2023_SEEN_MODAL_KEY,
} from '../lib/storage';
import OnboardingContext from '../contexts/OnboardingContext';
import AuthContext from '../contexts/AuthContext';

type LegoReferralBadgeProps = {
  className?: string;
  campaignKey: ReferralCampaignKey;
  autoOpenModal?: boolean;
};

const LegoReferralBadge = ({
  className,
  campaignKey,
  autoOpenModal = false,
}: LegoReferralBadgeProps): ReactElement => {
  const { isReady, referralCurrentCount, referralTargetCount } =
    useReferralCampaign({
      campaignKey,
    });
  const { openModal } = useLazyModal();
  const [isHiddenFromHeader = true] = usePersistentContext(
    LEGO_REFERRAL_CAMPAIGN_MAY_2023_HIDDEN_FROM_HEADER_KEY,
    false,
  );
  const { user } = useContext(AuthContext);
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const shouldShowModal =
    useMemo(() => {
      if (!user?.createdAt) {
        return false;
      }

      const registrationDate = new Date(user.createdAt);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      return Date.now() - registrationDate.getTime() > sevenDays;
    }, [user?.createdAt]) && !showArticleOnboarding;

  const onOpenModal = useCallback(() => {
    openModal({
      type: LazyModal.LegoReferralCampaign,
      props: {
        campaignKey,
        onAfterClose: () => {
          setCache(LEGO_REFERRAL_CAMPAIGN_MAY_2023_SEEN_MODAL_KEY, true);
        },
      },
    });
  }, [campaignKey, openModal]);

  useEffect(() => {
    if (!autoOpenModal || !isReady || !shouldShowModal) {
      return undefined;
    }

    let mounted = true;

    const tryModalOpen = async () => {
      const seenModal = await getCache(
        LEGO_REFERRAL_CAMPAIGN_MAY_2023_SEEN_MODAL_KEY,
      );

      if (!seenModal && mounted) {
        onOpenModal();
      }
    };

    tryModalOpen();

    return () => {
      mounted = false;
    };
  }, [autoOpenModal, onOpenModal, isReady, shouldShowModal]);

  if (isHiddenFromHeader) {
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
        onOpenModal();
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
