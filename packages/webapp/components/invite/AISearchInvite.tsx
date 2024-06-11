import React, { ReactElement, useEffect } from 'react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import { KeyIcon } from '@dailydotdev/shared/src/components/icons';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useMutation } from '@tanstack/react-query';
import { acceptFeatureInvitation } from '@dailydotdev/shared/src/graphql/features';
import { useRouter } from 'next/router';
import { useActions } from '@dailydotdev/shared/src/hooks/useActions';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import {
  ApiErrorResult,
  DEFAULT_ERROR,
} from '@dailydotdev/shared/src/graphql/common';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { ReferralCampaignKey } from '@dailydotdev/shared/src/hooks';
import { DailyDevLogo, JoinPageProps } from './common';

export function AISearchInvite({
  referringUser,
  redirectTo,
  token,
}: JoinPageProps): ReactElement {
  const router = useRouter();
  const { completeAction } = useActions();
  const { logEvent } = useLogContext();
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
      return showLogin({
        trigger: AuthTriggers.SearchReferral,
        options: {
          onLoginSuccess: handleAccept,
          onRegistrationSuccess: handleAccept,
        },
      });
    }

    // since in the page view, query params are logged automatically,
    // we don't need to send the params here explicitly
    logEvent({ event_name: LogEvent.AcceptInvitation });

    return handleAccept();
  };

  useEffect(() => {
    router.push(redirectTo);
    // router is an unstable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo]);

  return (
    <div className="relative flex h-full min-h-page flex-1 flex-col items-center justify-center overflow-hidden p-6 laptop:items-start">
      <DailyDevLogo />
      <div className="relative z-1 flex w-full flex-col tablet:max-w-[27.5rem] laptop:ml-3 laptopL:ml-[9.75rem]">
        <span className="mb-6 flex flex-col items-center gap-3 tablet:mb-10 tablet:gap-4 laptop:mb-8 laptop:flex-row laptop:items-start laptop:gap-2">
          <ProfileImageLink user={referringUser} />
          <p className="text-center text-text-tertiary typo-callout laptop:text-left">
            {referringUser.name}
            <br />
            invites you to try daily.dev search
          </p>
        </span>
        <h1 className="break-words-overflow w-full text-center font-bold typo-large-title tablet:typo-mega3 laptop:text-left">
          {referringUser.name.split(' ')[0]} gave you early access to daily.dev
          search!
        </h1>
        <p className="mt-6 text-center text-text-secondary laptop:text-left">
          This isn’t just another search engine; it’s a search engine that’s
          both fine-tuned for developers and fully integrated into the daily.dev
          ecosystem.
        </p>
        <Button
          icon={<KeyIcon secondary />}
          className="mt-12"
          variant={ButtonVariant.Primary}
          onClick={handleAcceptClick}
          loading={isLoading}
          disabled={isLoading || isSuccess}
        >
          Accept invitation ➔
        </Button>
      </div>
      <img
        src={cloudinary.referralCampaign.search.bg}
        alt="search input depicting our new AI search feature"
        className="absolute right-0 z-0 hidden tablet:w-1/2 laptop:block"
      />
      <img
        src={cloudinary.referralCampaign.search.bgPopupMobile}
        alt="search input depicting our new AI search feature"
        className="hidden max-w-[27.5rem] tablet:block laptop:hidden"
      />
      <img
        src={cloudinary.referralCampaign.search.bgMobile}
        alt="search input depicting our new AI search feature"
        className="absolute inset-0 top-[unset] z-0 block w-full translate-y-1/2 tablet:hidden"
      />
    </div>
  );
}
