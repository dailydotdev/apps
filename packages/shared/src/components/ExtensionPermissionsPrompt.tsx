import React, { MutableRefObject, ReactElement } from 'react';
import Logo, { LogoPosition } from './Logo';
import { OnboardingTitleGradient } from './onboarding/common';
import { Button, ButtonSize } from './buttons/Button';
import { cloudinary } from '../lib/image';
import { useExtensionContext } from '../contexts/ExtensionContext';
import { useHostStatus } from '../hooks/useHostPermissionStatus';

const ExtensionPermissionsPrompt = ({
  pageRef,
}: {
  pageRef: MutableRefObject<string>;
}): ReactElement => {
  // eslint-disable-next-line no-param-reassign
  pageRef.current = '/permissions';
  const { requestHostPermissions, origins } = useExtensionContext();
  const { refetch: refetchHostPermissions } = useHostStatus();

  const handleRequestHostPermissions = async () => {
    const success = await requestHostPermissions({ origins });
    if (success) {
      refetchHostPermissions();
    }
  };

  return (
    <div className="flex overflow-hidden flex-col justify-center items-center px-7 antialiased text-center min-h-[100vh] max-h-[100vh]">
      <Logo position={LogoPosition.Relative} logoClassName="h-logo-big" />

      <OnboardingTitleGradient className="my-6 typo-mega2 tablet:typo-mega1">
        Let&apos;s get started
      </OnboardingTitleGradient>

      <p className="mb-9 tablet:mb-16 max-w-[40rem] typo-title3 tablet:typo-title2">
        To get started, please allow us to manage data on the
        &apos;daily.dev&apos; domain. This is solely for technical purposes,
        like login and authentication. We value your privacy -- no fishy stuff
        here
      </p>

      <Button
        className="z-1 w-full btn-primary max-w-[18.75rem]"
        buttonSize={ButtonSize.Large}
        onClick={handleRequestHostPermissions}
      >
        Enable access ➔
      </Button>

      <img
        className="absolute bottom-0 z-0 w-[33rem]"
        src={cloudinary.onboarding.glow}
        alt="Gradient background"
      />
    </div>
  );
};

export default ExtensionPermissionsPrompt;
