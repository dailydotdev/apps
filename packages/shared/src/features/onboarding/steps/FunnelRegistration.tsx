import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
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
import { useAuthContext } from '../../../contexts/AuthContext';
import { labels } from '../../../lib';
import { AuthEvent, isNativeAuthSupported } from '../../../lib/auth';
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
import { isIOSNative } from '../../../lib/func';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';
import Alert, { AlertType } from '../../../components/widgets/Alert';

const supportedEvents = [AuthEvent.SocialRegistration, AuthEvent.Login];

const useRegistrationListeners = (
  onTransition: FunnelStepSignup['onTransition'],
) => {
  const { displayToast } = useToastNotification();
  const { refetchBoot } = useAuthContext();
  const router = useRouter();

  const onProviderMessage = async (e: MessageEvent) => {
    const isEventSupported = supportedEvents.includes(e.data?.eventKey);

    if (!isEventSupported) {
      return undefined;
    }

    if (e.data?.flow) {
      return displayToast(labels.auth.error.generic);
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
};

function InnerFunnelRegistration({
  parameters: { headline, image, imageMobile },
  onTransition,
}: FunnelStepSignup): ReactElement {
  const router = useRouter();
  const isTablet = useViewSize(ViewSize.Tablet);
  const shouldRedirect = shouldRedirectAuth();
  const windowPopup = useRef<Window | null>(null);
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
        return;
      }

      if (isIOSNative()) {
        window.location.href = redirect;
      } else if (windowPopup.current) {
        windowPopup.current.location.href = redirect;
      } else {
        window.location.href = redirect;
      }
    },
    keepSession: true,
  });

  const subscriberEmail = router?.query?.subscribed;

  const onRegister = (provider: SocialProvider) => {
    const shouldUsePopup =
      !shouldRedirect && !isNativeAuthSupported(provider) && !isIOSNative();

    if (shouldUsePopup) {
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
