import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { noindexSeoProps } from '../../next-seo';

const SIGNED_QUERY_PARAMS = ['sig', 'exp', 'ba_iat', 'ba_pl', 'ba_param'];
const LOGIN_PROMPT = 'login';
const MAX_AGE_PARAM = 'max_age';

const getPrompts = (params: URLSearchParams): string[] =>
  params.get('prompt')?.split(' ').filter(Boolean) ?? [];

const needsReauthentication = (search: string): boolean => {
  const params = new URLSearchParams(search);
  return getPrompts(params).includes(LOGIN_PROMPT) || params.has(MAX_AGE_PARAM);
};

const getAuthorizeUrl = (search: string): string => {
  const params = new URLSearchParams(search);
  SIGNED_QUERY_PARAMS.forEach((param) => params.delete(param));
  params.delete(MAX_AGE_PARAM);

  const prompt = getPrompts(params)
    .filter((value) => value !== LOGIN_PROMPT)
    .join(' ');
  if (prompt) {
    params.set('prompt', prompt);
  } else {
    params.delete('prompt');
  }

  return `${apiUrl}/auth/oauth2/authorize?${params}`;
};

const OAuthLoginPage = (): ReactElement => {
  const { showLogin, user, isAuthReady } = useAuthContext();
  const hasFreshLogin = useRef(false);
  const [shouldReauthenticate, setShouldReauthenticate] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      hasFreshLogin.current = true;
      showLogin({ trigger: AuthTriggers.OAuth });
      return;
    }

    if (
      !hasFreshLogin.current &&
      needsReauthentication(window.location.search)
    ) {
      setShouldReauthenticate(true);
      return;
    }

    window.location.href = getAuthorizeUrl(window.location.search);
  }, [isAuthReady, user, showLogin]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Logo
        position={LogoPosition.Relative}
        logoClassName={{ container: 'h-8' }}
      />
      {shouldReauthenticate && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="max-w-[30rem] text-center"
        >
          This app asked you to sign in again. Please log out of daily.dev, then
          start the sign-in from the app again. You will be asked to log in.
        </Typography>
      )}
    </main>
  );
};

OAuthLoginPage.layoutProps = { seo: { ...noindexSeoProps } };

export default OAuthLoginPage;
