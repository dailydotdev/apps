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
import { SearchExperiment } from '@dailydotdev/shared/src/lib/featureValues';
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

export function AISearchInvite({
  referringUser,
  redirectTo,
  token,
}: JoinPageProps): ReactElement {
  const router = useRouter();
  const search = useFeature(feature.search);
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
        completeAction(ActionType.AcceptedSearch),
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
        feature: ReferralCampaignKey.Search,
      });

    if (!user) {
      return showLogin(AuthTriggers.SearchReferral, {
        onLoginSuccess: handleAccept,
        onRegistrationSuccess: handleAccept,
      });
    }

    // since in the page view, query params are tracked automatically,
    // we don't need to send the params here explicitly
    trackEvent({ event_name: AnalyticsEvent.AcceptInvitation });

    return handleAccept();
  };

  useEffect(() => {
    if (search === SearchExperiment.Control) {
      return;
    }

    router.push(redirectTo);
    // router is an unstable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo, search]);

  return (
    <div className="flex overflow-hidden tablet:overflow-auto relative flex-col flex-1 justify-center p-6 h-full min-h-[100vh]">
      <span className="absolute top-8 left-1/2 laptop:left-8 -translate-x-1/2 laptop:translate-x-0">
        <Logo showGreeting={false} position={LogoPosition.Relative} />
      </span>
      <div className="flex flex-col laptop:ml-3 w-full tablet:max-w-[27.5rem] laptopL:ml-[9.75rem]">
        <span className="flex flex-col tablet:flex-row gap-2 items-center tablet:items-start mb-6">
          <ProfileImageLink user={referringUser} />
          <p className="text-center tablet:text-left text-theme-label-tertiary typo-callout">
            {referringUser.name}
            <br />
            invites you to try daily.dev search
          </p>
        </span>
        <h1 className="w-full font-bold text-center tablet:text-left break-words-overflow typo-large-title tablet:typo-mega1">
          {referringUser.name.split(' ')[0]} gave you early access to daily.dev
          search!
        </h1>
        <p className="mt-6 text-center tablet:text-left text-theme-label-secondary">
          This isn’t just another search engine; it’s a search engine that’s
          both fine-tuned for developers and fully integrated into the daily.dev
          ecosystem.
        </p>
        <Button
          icon={<KeyIcon secondary />}
          className="mt-12 btn-primary"
          onClick={handleAcceptClick}
          type="button"
          loading={isLoading}
          disabled={isLoading || isSuccess}
        >
          Accept invitation ➔
        </Button>
      </div>
      <img
        src={cloudinary.referralCampaign.search.bg}
        alt="search input depicting our new AI search feature"
        className="hidden tablet:block absolute right-0 tablet:w-1/2"
      />
      <img
        src={cloudinary.referralCampaign.search.bgMobile}
        alt="search input depicting our new AI search feature"
        className="block tablet:hidden absolute inset-0 w-full translate-y-1/2 top-[unset]"
      />
    </div>
  );
}
