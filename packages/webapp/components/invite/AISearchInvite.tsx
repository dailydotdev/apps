import React, { ReactElement } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import HeaderLogo from '@dailydotdev/shared/src/components/layout/HeaderLogo';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import KeyIcon from '@dailydotdev/shared/src/components/icons/Key';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useMutation } from 'react-query';
import { acceptFeatureInvitation } from '@dailydotdev/shared/src/graphql/features';
import { useRouter } from 'next/router';
import { campaignConfig, JoinPageProps } from './common';

export function AISearchInvite({
  referringUser,
  token,
}: JoinPageProps): ReactElement {
  const router = useRouter();
  const { user, showLogin } = useAuthContext();
  const { mutateAsync: onAcceptMutation } = useMutation(
    acceptFeatureInvitation,
    {
      onSuccess: () => {
        router.push(campaignConfig.search.redirectTo);
      },
      onError: () => {
        // TODO: display a toast based from the error response
      },
    },
  );

  const handleAcceptClick = () => {
    if (!user) {
      return showLogin(AuthTriggers.Author);
    }

    return onAcceptMutation({ token, referrerId: referringUser.id });
  };

  return (
    <div className="flex relative flex-col flex-1 justify-center h-full min-h-page">
      <span className="absolute top-8 left-8">
        <HeaderLogo />
      </span>
      <div className="flex flex-col w-full max-w-[27.5rem] ml-[11.25rem]">
        <span className="flex flex-row gap-2 mb-6">
          <ProfileImageLink user={referringUser} />
          <p className="text-theme-label-tertiary typo-callout">
            {referringUser.name}
            <br />
            invites you to try daily.dev search
          </p>
        </span>
        <h1 className="w-full font-bold break-words-overflow typo-mega1">
          {referringUser.name.split(' ')[0]} gave you early access to daily.dev
          search!
        </h1>
        <p className="mt-6 text-theme-label-secondary">
          This isn’t just another search engine; it’s a search engine that’s
          both fine-tuned for developers and fully integrated into the daily.dev
          ecosystem.
        </p>
        <Button
          icon={<KeyIcon secondary />}
          className="mt-12 btn-primary"
          onClick={handleAcceptClick}
        >
          Accept invitation ➔
        </Button>
      </div>
      <img
        src="./bg.png"
        alt="search input depicting our new AI search feature"
        className="absolute right-0 h-full max-w-[58.75rem]"
      />
    </div>
  );
}
