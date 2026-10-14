import type { NextSeoProps } from 'next-seo';
import {
  broadcastMessage,
  postWindowMessage,
  isPWA,
} from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/auth';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  AUTH_REDIRECT_KEY,
  shouldRedirectAuth,
} from '@dailydotdev/shared/src/features/onboarding/shared';
import { noindexSeoProps } from '../next-seo';

const seo: NextSeoProps = { ...noindexSeoProps };

const DEFAULT_ERROR_MESSAGE = 'Please go back and try again.';

const errorMessages: Record<string, string> = {
  access_denied: 'The sign-in was canceled. Please go back and try again.',
  client_disabled:
    'This app has been disabled and can no longer connect to daily.dev.',
  invalid_client:
    'This app could not be found. It may have been deleted or set up incorrectly.',
  invalid_redirect:
    "This app's redirect address is not registered. Please contact the app's developer.",
  unauthorized_client: 'This app is not allowed to sign in with daily.dev.',
};

const ERROR_CODE_PATTERN = /^[a-z0-9_]+$/;

const checkShouldSendBroadcast = () => {
  const ua = navigator.userAgent;
  const isFromFacebook = document.referrer === 'https://www.facebook.com/';
  const isInstagramWebview = /Instagram/i.test(ua);
  const postMessageUndefined = !window.opener?.postMessage;
  const conditions = [isFromFacebook, isInstagramWebview, postMessageUndefined];

  return conditions.some(Boolean);
};

const handleRedirectAuth = (params: URLSearchParams) => {
  const href = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);

  if (href) {
    const [redirect, hrefParams] = href.split('?');
    const redirectParams = new URLSearchParams(hrefParams);

    Object.entries(redirectParams).forEach(([key, value]) =>
      params.set(key, value),
    );

    window.location.replace(`${redirect}?${params}`);
  }
};

function CallbackPage(): ReactElement | null {
  const { logEvent } = useLogContext();
  const [errorCode, setErrorCode] = useState<string>();
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.delete('code');
    const params = Object.fromEntries(urlSearchParams.entries());
    const eventKey = params.login
      ? AuthEvent.Login
      : AuthEvent.SocialRegistration;
    logEvent({
      event_name: 'registration callback',
      extra: JSON.stringify(params),
    });
    const search = new URLSearchParams(params);
    try {
      if (!window.opener && params.flow && params.settings) {
        window.location.replace(`/reset-password?${search}`);
        return;
      }

      if (shouldRedirectAuth()) {
        handleRedirectAuth(urlSearchParams);
        return;
      }

      if (checkShouldSendBroadcast()) {
        broadcastMessage({ ...params, eventKey });
      } else {
        postWindowMessage(eventKey, params);
      }

      const error = urlSearchParams.get('error');
      if (!window.opener && error) {
        setErrorCode(ERROR_CODE_PATTERN.test(error) ? error : '');
        return;
      }

      if (!isPWA()) {
        window.close();
      }

      // Some browsers/app webviews null out `window.opener` during auth,
      // while still allowing a script-opened tab to close itself. Try the
      // close first and only fall back to a redirect if we know there is no
      // opener to return to.
      if (window.opener) {
        return;
      }

      setTimeout(() => {
        window.location.replace('/onboarding');
      }, 300);
    } catch (err) {
      const url = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?${search}`;
      window.location.replace(url);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof errorCode === 'undefined') {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Logo
        position={LogoPosition.Relative}
        className="mb-10"
        logoClassName={{ container: 'h-8' }}
      />
      <div className="flex w-full max-w-[30rem] flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-6">
        <Typography bold tag={TypographyTag.H1} type={TypographyType.Title2}>
          Something went wrong
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {errorMessages[errorCode] ?? DEFAULT_ERROR_MESSAGE}
        </Typography>
        {errorCode && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Error code: {errorCode}
          </Typography>
        )}
      </div>
    </main>
  );
}

CallbackPage.layoutProps = { seo };

export default CallbackPage;
