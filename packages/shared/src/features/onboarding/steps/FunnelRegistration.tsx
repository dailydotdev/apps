import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
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
import { sanitizeMessage, shouldRedirectAuth } from '../shared';
import type { FunnelStepSignup } from '../types/funnel';
import { useConsentCookie } from '../../../hooks/useCookieConsent';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';

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

function InnerFunnelRegistration({
  parameters: { headline, image, imageMobile },
  onTransition,
}: FunnelStepSignup): ReactElement {
  const router = useRouter();
  const isTablet = useViewSize(ViewSize.Tablet);
  const shouldRedirect = shouldRedirectAuth();
  const windowPopup = useRef<Window>(null);
  const { cookieExists } = useConsentCookie(GdprConsentKey.Marketing);
  const { onSocialRegistration } = useRegistration({
    key: ['registration_funnel'],
    enabled: !!router?.isReady,
    params: shouldRedirect
      ? { redirect_to: window.location.href, return_to: window.location.href }
      : undefined,
    onRedirectFail: () => {
      windowPopup.current?.close();
      windowPopup.current = null;
    },
    onRedirect: (redirect) => {
      if (shouldRedirect) {
        window.location.href = redirect;
      } else {
        windowPopup.current.location.href = redirect;
      }
    },
    keepSession: true,
  });

  const onRegister = (provider: SocialProvider) => {
    if (!isNativeAuthSupported(provider) && !shouldRedirect) {
      windowPopup.current = window.open();
    }
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onTransition);

  const sanitizedHeading = useMemo(() => sanitizeMessage(headline), [headline]);

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className={classNames(
            'absolute bottom-0 w-full bg-gradient-to-t from-surface-invert via-surface-invert via-70% to-transparent to-90%',
            !cookieExists ? 'h-2/3' : 'h-3/5',
          )}
        />
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
  const isBootCheck = useRef(false);
  const { isLoggedIn, isAuthReady } = useAuthContext();

  useEffect(() => {
    if (isBootCheck.current || !isActive || !isAuthReady) {
      return;
    }

    isBootCheck.current = true;

    if (!isLoggedIn) {
      return;
    }

    onTransition({
      type: FunnelStepTransitionType.Complete,
    });
  }, [isLoggedIn, isAuthReady, isActive, onTransition]);

  if (!isActive || !isAuthReady || isLoggedIn) {
    return null;
  }

  return <InnerFunnelRegistration {...props} onTransition={onTransition} />;
}
