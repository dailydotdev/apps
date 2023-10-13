import React, { ReactElement } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import KeyIcon from '@dailydotdev/shared/src/components/icons/Key';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useMutation } from 'react-query';
import { acceptFeatureInvitation } from '@dailydotdev/shared/src/graphql/features';
import { useRouter } from 'next/router';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
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
    <div className="flex relative flex-col flex-1 justify-center p-6 h-full min-h-[100vh]">
      <span className="absolute top-8 left-1/2 laptop:left-8 -translate-x-1/2 laptop:translate-x-0">
        <Logo showGreeting={false} position={LogoPosition.Relative} />
      </span>
      <div className="flex flex-col laptop:ml-3 w-full max-w-[27.5rem] laptopL:ml-[9.75rem]">
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
        >
          Accept invitation ➔
        </Button>
      </div>
      <img
        src="./bg.png" // TODO: upload to cloudinary
        alt="search input depicting our new AI search feature"
        className="hidden tablet:block absolute right-0 tablet:w-1/2"
      />
      <img
        src="./bg_mobile.png" // TODO: upload to cloudinary
        alt="search input depicting our new AI search feature"
        className="block tablet:hidden absolute inset-0 w-full translate-y-1/2 top-[unset]"
      />
    </div>
  );
}
