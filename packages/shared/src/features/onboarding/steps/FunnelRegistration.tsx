import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { SocialRegistration } from '../../common/components/SocialRegistration';
import type { SocialProvider } from '../../../components/auth/common';
import useRegistration from '../../../hooks/useRegistration';
import { useEventListener, useToastNotification } from '../../../hooks';
import {
  AuthEvent,
  AuthFlow,
  getKratosFlow,
  KRATOS_ERROR,
} from '../../../lib/kratos';
import { useAuthContext } from '../../../contexts/AuthContext';
import { labels } from '../../../lib';
import { AuthEventNames, isNativeAuthSupported } from '../../../lib/auth';
import { useLogContext } from '../../../contexts/LogContext';
import { broadcastChannel } from '../../../lib/constants';
import Logo, { LogoPosition } from '../../../components/Logo';
import type { LoggedUser } from '../../../lib/user';
import type { FunnelStepTransitionCallback } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';

interface FunnelRegistrationProps {
  onTransition?: FunnelStepTransitionCallback<void>;
  heading: ReactNode;
  image: string;
}

const supportedEvents = [AuthEvent.SocialRegistration, AuthEvent.Login];

const useRegistrationListeners = (
  onTransition: FunnelRegistrationProps['onTransition'],
) => {
  const { displayToast } = useToastNotification();
  const { refetchBoot } = useAuthContext();
  const { logEvent } = useLogContext();
  const router = useRouter();

  const onProviderMessage = async (e: MessageEvent) => {
    const isEventSupported = supportedEvents.includes(e.data?.eventKey);

    if (!isEventSupported) {
      return undefined;
    }

    if (e.data?.flow) {
      const connected = await getKratosFlow(AuthFlow.Registration, e.data.flow);

      logEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: {
            flowId: connected?.id,
            messages: connected?.ui?.messages,
          },
          origin: 'window registration flow error',
        }),
      });

      if (
        [
          KRATOS_ERROR.NO_STRATEGY_TO_LOGIN,
          KRATOS_ERROR.NO_STRATEGY_TO_SIGNUP,
          KRATOS_ERROR.EXISTING_USER,
        ].includes(connected?.ui?.messages?.[0]?.id)
      ) {
        return displayToast(labels.auth.error.existingEmail);
      }

      return displayToast(labels.auth.error.generic);
    }

    const bootResponse = await refetchBoot();
    const user = bootResponse?.data?.user;

    if (!user || !('providers' in user)) {
      return displayToast(labels.auth.error.generic);
    }

    const isPlus = (bootResponse?.data?.user as LoggedUser)?.isPlus;

    if (isPlus) {
      displayToast('You are already a daily.dev Plus user');
      return router.push('/');
    }

    return onTransition({ type: FunnelStepTransitionType.Complete });
  };

  useEventListener(broadcastChannel, 'message', onProviderMessage);

  useEventListener(globalThis, 'message', onProviderMessage);
};

export function FunnelRegistration({
  heading,
  image,
  onTransition,
}: FunnelRegistrationProps): ReactElement {
  const windowPopup = useRef<Window>(null);
  const { onSocialRegistration } = useRegistration({
    key: ['registration_funnel'],
    onRedirectFail: () => {
      windowPopup.current.close();
      windowPopup.current = null;
    },
    onRedirect: (redirect) => {
      windowPopup.current.location.href = redirect;
    },
  });

  const onRegister = (provider: SocialProvider) => {
    if (!isNativeAuthSupported(provider)) {
      windowPopup.current = window.open();
    }
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onTransition);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 h-3/5 w-full bg-gradient-to-t from-surface-invert via-surface-invert via-70% to-transparent to-90%" />
        <img
          className="pointer-events-none -z-1 w-full"
          alt="background"
          src={image}
        />
      </div>
      <div
        className="z-1 mt-auto flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96"
        data-testid="registration-container"
      >
        <Logo
          position={LogoPosition.Relative}
          data-testid="registration-logo"
        />

        <Typography
          type={TypographyType.Title2}
          className="text-center"
          data-testid="registration-title"
        >
          {heading}
        </Typography>
        <SocialRegistration onClick={onRegister} />
      </div>
    </div>
  );
}
