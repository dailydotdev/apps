import React, { ReactElement, useEffect } from 'react';
import Logo, { LogoPosition } from './Logo';
import { OnboardingTitleGradient } from './onboarding/common';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { cloudinary } from '../lib/image';
import { useExtensionContext } from '../contexts/ExtensionContext';
import { useHostStatus } from '../hooks/useHostPermissionStatus';

const ExtensionPermissionsPrompt = (): ReactElement => {
  const { requestHostPermissions, origins, setCurrentPage } =
    useExtensionContext();
  const { refetch: refetchHostPermissions } = useHostStatus();

  useEffect(() => {
    setCurrentPage('/permissions');

    return () => {
      setCurrentPage('/');
    };
  }, [setCurrentPage]);

  const handleRequestHostPermissions = async () => {
    const success = await requestHostPermissions({ origins });
    if (success) {
      refetchHostPermissions();
    }
  };

  return (
    <div className="flex max-h-screen min-h-screen flex-col items-center justify-center overflow-hidden px-7 text-center antialiased">
      <Logo
        position={LogoPosition.Relative}
        logoClassName={{ container: 'h-logo-big' }}
      />

      <OnboardingTitleGradient className="my-6 typo-mega2 tablet:typo-mega1">
        Let&apos;s get started
      </OnboardingTitleGradient>

      <p className="mb-9 max-w-[40rem] typo-title3 tablet:mb-16 tablet:typo-title2">
        To get started, please allow us to manage data on the
        &apos;daily.dev&apos; domain. This is solely for technical purposes,
        like login and authentication. We value your privacy -- no fishy stuff
        here
      </p>

      <Button
        className="z-1 w-full max-w-[18.75rem]"
        size={ButtonSize.Large}
        variant={ButtonVariant.Primary}
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
