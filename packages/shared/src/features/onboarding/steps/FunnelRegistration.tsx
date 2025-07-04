import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
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
import {
  AUTH_REDIRECT_KEY,
  sanitizeMessage,
  shouldRedirectAuth,
} from '../shared';
import type { FunnelStepSignup } from '../types/funnel';
import { useConsentCookie } from '../../../hooks/useCookieConsent';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';
import Alert, { AlertType } from '../../../components/widgets/Alert';

const supportedEvents = [AuthEvent.SocialRegistration, AuthEvent.Login];

const invalidErrors = [
  KRATOS_ERROR.NO_STRATEGY_TO_LOGIN,
  KRATOS_ERROR.NO_STRATEGY_TO_SIGNUP,
  KRATOS_ERROR.EXISTING_USER,
];

const useRegistrationListeners = (
  onTransition: FunnelStepSignup['onTransition'],
) => {
  const { displayToast } = useToastNotification();
  const { refetchBoot } = useAuthContext();
  const { logEvent } = useLogContext();
  const router = useRouter();

  const handleExistingFlow = useCallback(
    async (flow: string) => {
      const connected = await getKratosFlow(AuthFlow.Registration, flow);

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

      const code = connected?.ui?.messages?.[0]?.id;

      if (invalidErrors.includes(code)) {
        return displayToast(`${labels.auth.error.existingEmail} Code: ${code}`);
      }

      return displayToast(`${labels.auth.error.generic} Code: ${code}`);
    },
    [displayToast, logEvent],
  );

  const onProviderMessage = async (e: MessageEvent) => {
    const isEventSupported = supportedEvents.includes(e.data?.eventKey);

    if (!isEventSupported) {
      return undefined;
    }

    if (e.data?.flow) {
      return handleExistingFlow(e.data.flow);
    }

    const bootResponse = await refetchBoot();
    const user = bootResponse?.data?.user;

    if (!user || !('providers' in user)) {
      return displayToast(labels.auth.error.generic);
    }

    const params = new URLSearchParams(window.location.search);
    const isPlus = (bootResponse?.data?.user as LoggedUser)?.isPlus;

    if (isPlus && !params.get('subscribed')) {
      displayToast('You are already a daily.dev Plus user');
      return router.push('/');
    }

    return onTransition({ type: FunnelStepTransitionType.Complete });
  };

  useEventListener(broadcastChannel, 'message', onProviderMessage);

  useEventListener(globalThis, 'message', onProviderMessage);

  useEffect(() => {
    if (!router?.isReady || !router?.query?.flow) {
      return;
    }

    const flowFn = async () => {
      await handleExistingFlow(router.query.flow as string);
      const url = new URL(window.location.href);
      const fullPath = url.origin + url.pathname;
      const { flow, ...rest } = router.query;
      const params = new URLSearchParams(rest as Record<string, string>);
      router.replace(`${fullPath}?${params}`);
    };

    flowFn();
  }, [handleExistingFlow, router]);
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
        window.sessionStorage.setItem(AUTH_REDIRECT_KEY, window.location.href);
        window.location.href = redirect;
      } else {
        windowPopup.current.location.href = redirect;
      }
    },
    keepSession: true,
  });

  const subscriberEmail = router?.query?.subscribed;

  const onRegister = (provider: SocialProvider) => {
    if (!isNativeAuthSupported(provider) && !shouldRedirect) {
      windowPopup.current = window.open();
    }
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onTransition);

  const sanitizedHeading = useMemo(() => sanitizeMessage(headline), [headline]);

  useEffect(() => {
    if (typeof window === 'undefined' || !shouldRedirect) {
      return;
    }

    window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  }, [shouldRedirect]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 tablet:left-1/2 tablet:min-w-[100dvw] tablet:-translate-x-1/2">
        <div
          className={classNames(
            'absolute bottom-0 w-full bg-gradient-to-t from-surface-invert via-surface-invert via-70% to-transparent to-90%',
            !cookieExists ? 'h-2/3' : 'h-3/5',
          )}
        />
        <img
          className="pointer-events-none -z-1 max-h-full w-full object-cover object-center"
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
          color={TypographyColor.Primary}
          type={TypographyType.Title2}
          className="text-center"
          dangerouslySetInnerHTML={{ __html: sanitizedHeading }}
          data-testid="registgration-heading"
        />
        {subscriberEmail && (
          <Alert
            type={AlertType.Info}
            title={`Please sign up using the email address ${subscriberEmail} to claim your daily.dev Plus subscription.`}
          />
        )}
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
