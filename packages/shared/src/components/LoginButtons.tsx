import React, { ReactElement, useContext } from 'react';
import { useRouter } from 'next/router';
import GitHubIcon from './icons/GitHub';
import GoogleIcon from '../../icons/google_color.svg';
import { privacyPolicy, termsOfService } from '../lib/constants';
import { LegalNotice } from './utilities';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import { apiUrl } from '../lib/config';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { useMyFeed } from '../hooks/useMyFeed';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../lib/featureManagement';

export default function LoginButtons(): ReactElement {
  const router = useRouter();
  const { flags } = useContext(FeaturesContext);
  const { getRedirectUri } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const { checkHasLocalFilters } = useMyFeed();
  const buttonCopyPrefix = getFeatureValue(
    Features.LoginModalButtonCopyPrefix,
    flags,
  );

  const authUrl = (provider: string, redirectUri: string) => {
    const uri = checkHasLocalFilters()
      ? `${redirectUri}?create_filters=true`
      : redirectUri;

    return `${apiUrl}/v1/auth/authorize?provider=${provider}&redirect_uri=${encodeURI(
      uri,
    )}&skip_authenticate=true&register_mode=${
      router.query.author ? 'author' : 'default'
    }`;
  };

  const login = (provider: string): void => {
    trackEvent({
      event_name: 'click',
      target_type: 'signup provider',
      target_id: provider,
    });
    const redirectUri = getRedirectUri();
    window.location.href = authUrl(provider, redirectUri);
  };

  return (
    <>
      <div className="flex flex-col items-stretch self-center -my-2">
        <Button
          className="my-2 btn-primary"
          onClick={() => login('github')}
          icon={<GitHubIcon secondary />}
        >
          {buttonCopyPrefix} GitHub
        </Button>
        <Button
          className="my-2 btn-primary"
          onClick={() => login('google')}
          icon={<GoogleIcon />}
        >
          {buttonCopyPrefix} Google
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
