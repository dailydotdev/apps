import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { noindexSeoProps } from '../../next-seo';

const SIGNED_QUERY_PARAMS = ['sig', 'exp', 'ba_iat', 'ba_pl', 'ba_param'];

const getAuthorizeUrl = (search: string): string => {
  const params = new URLSearchParams(search);
  SIGNED_QUERY_PARAMS.forEach((param) => params.delete(param));

  const prompt = params
    .get('prompt')
    ?.split(' ')
    .filter((value) => value !== 'login')
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

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      showLogin({ trigger: AuthTriggers.OAuth });
      return;
    }

    window.location.href = getAuthorizeUrl(window.location.search);
  }, [isAuthReady, user, showLogin]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Logo
        position={LogoPosition.Relative}
        logoClassName={{ container: 'h-8' }}
      />
    </main>
  );
};

OAuthLoginPage.layoutProps = { seo: { ...noindexSeoProps } };

export default OAuthLoginPage;
