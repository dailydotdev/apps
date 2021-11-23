import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import GitHubIcon from '../../icons/github.svg';
import { privacyPolicy, termsOfService } from '../lib/constants';
import { LegalNotice } from './utilities';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import { apiUrl } from '../lib/config';
import { logSignupProviderClick } from '../lib/analytics';

export default function LoginButtons(): ReactElement {
  const router = useRouter();
  const { getRedirectUri } = useContext(AuthContext);

  const authUrl = (provider: string, redirectUri: string) =>
    `${apiUrl}/v1/auth/authorize?provider=${provider}&redirect_uri=${encodeURI(
      redirectUri,
    )}&skip_authenticate=true&register_mode=${
      router.query.author ? 'author' : 'default'
    }`;

  const login = async (provider: string): Promise<void> => {
    await logSignupProviderClick(provider);
    const redirectUri = getRedirectUri();
    console.log(authUrl(provider, redirectUri));
    window.location.href = authUrl(provider, redirectUri);
  };

  return (
    <>
      <div className="flex flex-col items-stretch self-center -my-2">
        <Button
          className="my-2 btn-primary"
          onClick={() => login('github')}
          icon={<GitHubIcon />}
        >
          Sign in with GitHub
        </Button>
        <Button
          className="my-2 btn-primary"
          onClick={() => login('google')}
          icon={<img src="/google.svg" className="icon" alt="Google logo" />}
        >
          Sign in with Google
        </Button>
      </div>
      <LegalNotice
        className="self-center mt-8"
        style={{ maxWidth: '17.25rem' }}
      >
        By signing in I accept the{' '}
        <a href={termsOfService} target="_blank" rel="noopener">
          Terms of Service
        </a>{' '}
        and the{' '}
        <a href={privacyPolicy} target="_blank" rel="noopener">
          Privacy Policy
        </a>
        .
      </LegalNotice>
    </>
  );
}
