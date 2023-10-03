import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import CloseButton from '../CloseButton';
import LoginButton from '../LoginButton';
import { Button } from '../buttons/Button';
import { tellMeWhy } from '../../lib/constants';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { OnboardingV2 } from '../../lib/featureValues';
import { useAuthContext } from '../../contexts/AuthContext';
import usePersistentContext from '../../hooks/usePersistentContext';
import { generateStorageKey, StorageTopic } from '../../lib/storage';

export function FixedBottomBanner(): ReactElement {
  const { user } = useAuthContext();
  const router = useRouter();
  const onboarding = useFeature(feature.onboardingV2);
  const [isDismissed, setIsDismissed, isFetched] = usePersistentContext(
    generateStorageKey(StorageTopic.Onboarding, 'wall_dismissed'),
    false,
  );

  if (
    user ||
    router.pathname === '/onboarding' ||
    onboarding !== OnboardingV2.Control ||
    !isFetched ||
    isDismissed
  ) {
    return null;
  }

  return (
    <div className="flex fixed inset-0 z-max justify-center items-center p-6 w-full bg-gradient-to-l top-[unset] from-[#EF43FD] to-[#6451F3]">
      <CloseButton
        className="top-4 right-4"
        position="absolute"
        onClick={() => setIsDismissed(true)}
      />
      <div className="flex flex-col laptop:flex-row gap-4 justify-center laptop:items-center w-full laptop:max-w-[52.25rem]">
        <div className="flex flex-col flex-1 gap-2 w-full">
          <h1 className="font-bold typo-large-title">
            Registration is going to be required in 30 days
          </h1>
          <p className="flex flex-1 w-full typo-title3">
            We’d love to see you join our community ❤︎. Signing up gets you free
            access to the personalized feed, discussions, squads, AI search, and
            more!
          </p>
        </div>
        <div className="flex flex-row laptop:flex-col gap-2">
          <LoginButton
            showLoginButton={false}
            copy={{ signup: 'Sign up now' }}
          />
          <Button
            tag="a"
            target="_blank"
            href={tellMeWhy}
            className="btn-secondary"
          >
            Tell me why
          </Button>
        </div>
      </div>
    </div>
  );
}
