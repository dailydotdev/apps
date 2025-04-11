import type { ReactElement } from 'react';
import React, { useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { SocialRegistration } from '../shared/SocialRegistration';
import type { SocialProvider } from '../../../components/auth/common';
import useRegistration from '../../../hooks/useRegistration';
import {
  useEventListener,
  useToastNotification,
  useViewSize,
  ViewSize,
} from '../../../hooks';
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
import { FunnelStepTransitionType } from '../types/funnel';
import { sanitizeMessage } from '../shared';
import type { FunnelStepSignup } from '../types/funnel';
import { isWebView } from '../../../components/auth/OnboardingRegistrationForm';
import { isIOS } from '../../../lib/func';

const supportedEvents = [AuthEvent.SocialRegistration, AuthEvent.Login];

const useRegistrationListeners = (
  onTransition: FunnelStepSignup['onTransition'],
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

const checkIsInAppAndroid = () => {
  const inAppBrowser = isWebView();
  const confirmedIOS = isIOS();

  return inAppBrowser && !confirmedIOS;
};

function InnerFunnelRegistration({
  parameters: { headline, image, imageMobile },
  onTransition,
}: FunnelStepSignup): ReactElement {
  const router = useRouter();
  const isTablet = useViewSize(ViewSize.Tablet);
  const isAndroidWebView = checkIsInAppAndroid();
  const config = useMemo(() => {
    if (!router?.isReady) {
      return { enabled: false };
    }

    if (!isAndroidWebView) {
      return { enabled: true };
    }

    if (typeof window === 'undefined') {
      return { enabled: false };
    }

    return { enabled: true, redirect_to: window.location.href };
  }, [router?.isReady, isAndroidWebView]);

  const windowPopup = useRef<Window>(null);
  const closePopup = () => {
    windowPopup.current?.close();
    windowPopup.current = null;
  };
  const { onSocialRegistration } = useRegistration({
    key: ['registration_funnel'],
    enabled: config.enabled,
    params: config.redirect_to
      ? { redirect_to: config.redirect_to }
      : undefined,
    onRedirectFail: () => {
      closePopup();
    },
    onRedirect: (redirect) => {
      if (isAndroidWebView) {
        window.location.href = redirect;
      } else {
        windowPopup.current.location.href = redirect;
      }
    },
  });

  const onRegister = (provider: SocialProvider) => {
    if (!isNativeAuthSupported(provider) && !isAndroidWebView) {
      windowPopup.current = window.open();
    }
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onTransition);

  const sanitizedHeading = useMemo(() => sanitizeMessage(headline), [headline]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 h-3/5 w-full bg-gradient-to-t from-surface-invert via-surface-invert via-70% to-transparent to-90%" />
        <img
          className="pointer-events-none -z-1 w-full"
          alt="background"
          src={isTablet ? image : imageMobile}
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
          dangerouslySetInnerHTML={{ __html: sanitizedHeading }}
          data-testid="registgration-heading"
        />
        <SocialRegistration onClick={onRegister} />
      </div>
    </div>
  );
}

export function FunnelRegistration({
  onTransition,
  isActive,
  ...props
}: FunnelStepSignup): ReactElement {
  const { isLoggedIn, isAuthReady } = useAuthContext();

  if (!isActive || !isAuthReady) {
    return null;
  }

  if (isLoggedIn) {
    onTransition({
      type: FunnelStepTransitionType.Complete,
    });
    return null;
  }

  return <InnerFunnelRegistration {...props} onTransition={onTransition} />;
}
