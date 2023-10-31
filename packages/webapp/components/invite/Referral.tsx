import React, { ReactElement, useEffect } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import KeyIcon from '@dailydotdev/shared/src/components/icons/Key';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useMutation } from 'react-query';
import { acceptFeatureInvitation } from '@dailydotdev/shared/src/graphql/features';
import { useRouter } from 'next/router';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { GenericReferral } from '@dailydotdev/shared/src/lib/featureValues';
import { useActions } from '@dailydotdev/shared/src/hooks/useActions';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import {
  ApiErrorResult,
  DEFAULT_ERROR,
} from '@dailydotdev/shared/src/graphql/common';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useAnalyticsContext } from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { JoinPageProps } from './common';

export function Referral({
  referringUser,
  redirectTo,
  token,
}: JoinPageProps): ReactElement {
  const router = useRouter();
  const genericReferral = useFeature(feature.genericReferral);
  const { completeAction } = useActions();
  const { trackEvent } = useAnalyticsContext();
  const { displayToast } = useToastNotification();
  const { user, refetchBoot, showLogin } = useAuthContext();
  const {
    mutateAsync: onAcceptMutation,
    isLoading,
    isSuccess,
  } = useMutation(acceptFeatureInvitation, {
    onSuccess: async () => {
      await Promise.all([
        completeAction(ActionType.AcceptedGenericReferral),
        refetchBoot(),
      ]);
      router.push(redirectTo);
    },
    onError: (err: ApiErrorResult) => {
      const message = err?.response?.errors?.[0]?.message;
      displayToast(message ?? DEFAULT_ERROR);
    },
  });

  const handleAcceptClick = () => {
    const handleAccept = () =>
      onAcceptMutation({
        token,
        referrerId: referringUser.id,
        feature: ReferralCampaignKey.Generic,
      });

    if (!user) {
      return showLogin({
        trigger: AuthTriggers.GenericReferral,
        options: {
          onLoginSuccess: handleAccept,
          onRegistrationSuccess: handleAccept,
        },
      });
    }

    // since in the page view, query params are tracked automatically,
    // we don't need to send the params here explicitly
    trackEvent({ event_name: AnalyticsEvent.AcceptInvitation });

    return handleAccept();
  };

  useEffect(() => {
    if (genericReferral === GenericReferral.Control) {
      return;
    }

    router.push(redirectTo);
    // router is an unstable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo, genericReferral]);

  return (
    <div className="flex overflow-hidden relative flex-col flex-1 justify-center items-center laptop:items-start p-6 h-full min-h-[100vh]">
      <span className="absolute top-8 left-1/2 laptop:left-8 -translate-x-1/2 laptop:translate-x-0">
        <Logo showGreeting={false} position={LogoPosition.Relative} />
      </span>
      <div className="flex flex-col laptop:ml-3 w-full tablet:max-w-[30rem] laptopL:ml-[9.75rem] laptopL:max-w-[37.2rem]">
        <span className="flex flex-col laptop:flex-row gap-3 tablet:gap-4 laptop:gap-6 items-center laptop:items-start mb-6 tablet:mb-10 laptop:mb-8">
          <ProfileImageLink
            user={referringUser}
            picture={{ size: 'xxxlarge' }}
          />
          <p className="my-auto text-center laptop:text-left typo-title2">
            <b> {referringUser.name} </b>
            invited you to daily.dev
          </p>
        </span>
        <h1 className="w-full text-center laptop:text-left break-words-overflow typo-large-title tablet:typo-mega3 laptop:typo-giga3">
          The Homepage
          <b className="text-theme-color-cabbage"> Developers Deserve </b>
        </h1>
        <p className="mt-8 text-center laptop:text-left typo-title3 text-theme-label-tertiary">
          Get a feed of the best developer news out there! Read more quality
          articles. Stay up to date.
        </p>
        <Button
          icon={<KeyIcon secondary />}
          className="mt-12 btn-primary"
          onClick={handleAcceptClick}
          type="button"
          loading={isLoading}
          disabled={isLoading || isSuccess}
        >
          {`Add to browser - It's free`}
        </Button>
      </div>
      <img
        src={cloudinary.referralCampaign.search.bg}
        alt="search input depicting our new AI search feature"
        className="hidden laptop:block absolute right-0 tablet:w-1/2"
      />
    </div>
  );
}
