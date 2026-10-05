import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { getFirstQueryParam } from '@dailydotdev/shared/src/lib/func';
import { oauthPublicClientQueryOptions } from '@dailydotdev/shared/src/lib/oauthApps';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { noindexSeoProps } from '../../next-seo';

const OPTIONAL_SCOPES = ['write', 'offline_access'];

const scopeDescriptions: Record<string, string> = {
  openid: 'Know who you are on daily.dev',
  profile: 'See your name and profile picture',
  offline_access:
    "Stay connected when you're not using the app (refresh token)",
  read: 'Read content on daily.dev, like feeds, posts, comments and search, and your personal data: profile, bookmarks, custom feeds, followed and blocked tags and sources, notifications, tech stack and experiences',
  write:
    'Make changes on your behalf, like bookmarking posts and updating your feed settings',
};

const getUrlHost = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
};

const OAuthConsentPage = (): ReactElement => {
  const { query } = useRouter();
  const { showLogin, user, isAuthReady } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declinedScopes, setDeclinedScopes] = useState<string[]>([]);
  const [consentError, setConsentError] = useState<string>();
  const clientId = getFirstQueryParam(query.client_id);
  const requestedScopes = (getFirstQueryParam(query.scope) ?? '')
    .split(' ')
    .filter(Boolean);
  const scopes = requestedScopes.filter((scope) => scopeDescriptions[scope]);
  const grantedScopes = requestedScopes.filter(
    (scope) => !declinedScopes.includes(scope),
  );

  const toggleScope = (scope: string, isChecked: boolean) =>
    setDeclinedScopes((current) =>
      isChecked
        ? current.filter((value) => value !== scope)
        : [...current, scope],
    );
  const redirectHost = getUrlHost(getFirstQueryParam(query.redirect_uri));

  const { data: client, isError } = useQuery({
    ...oauthPublicClientQueryOptions(clientId as string),
    enabled: !!clientId && !!user,
  });

  useEffect(() => {
    if (isAuthReady && !user) {
      showLogin({ trigger: AuthTriggers.OAuth });
    }
  }, [isAuthReady, user, showLogin]);

  const onConsent = async (accept: boolean) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/auth/oauth2/consent`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          accept,
          oauth_query: window.location.search.slice(1),
          ...(accept &&
            declinedScopes.length > 0 && {
              scope: grantedScopes.join(' '),
            }),
        }),
      });
      const data: {
        url?: string;
        redirect_uri?: string;
        error?: string;
        error_description?: string;
        message?: string;
      } = await res.json().catch(() => ({}));
      const redirectUrl = data.url ?? data.redirect_uri;

      if (res.ok && redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setConsentError(
        data.error_description ||
          data.message ||
          data.error ||
          'Something went wrong. Please try again from the app.',
      );
    } catch {
      setConsentError('Something went wrong. Please try again from the app.');
    }

    setIsSubmitting(false);
  };

  const clientName = client?.client_name
    ? `"${client.client_name}"`
    : 'An application';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Logo
        position={LogoPosition.Relative}
        className="mb-10"
        logoClassName={{ container: 'h-8' }}
      />
      {user && (
        <div className="flex w-full max-w-[30rem] flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
          <Typography bold tag={TypographyTag.H1} type={TypographyType.Title2}>
            {isError
              ? 'This application could not be found'
              : `${clientName} wants to access your daily.dev account`}
          </Typography>
          {!isError && (
            <>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Signed in as @{user.username}. This will allow {clientName}
                {client?.client_uri ? ` (${client.client_uri})` : ''} to:
              </Typography>
              <div className="flex flex-col gap-1 rounded-12 bg-status-warning p-3">
                <Typography type={TypographyType.Callout} bold>
                  This app is not made or controlled by daily.dev. Only continue
                  if you trust it.
                </Typography>
                {redirectHost && (
                  <Typography type={TypographyType.Callout}>
                    You will be redirected to {redirectHost}.
                  </Typography>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {scopes.map((scope) =>
                  OPTIONAL_SCOPES.includes(scope) ? (
                    <Checkbox
                      key={scope}
                      name={scope}
                      checked={!declinedScopes.includes(scope)}
                      onToggleCallback={(isChecked) =>
                        toggleScope(scope, isChecked)
                      }
                    >
                      <span className="text-text-primary">
                        {scopeDescriptions[scope]}
                      </span>
                    </Checkbox>
                  ) : (
                    <Checkbox key={scope} name={scope} checked disabled>
                      <span className="text-text-primary">
                        {scopeDescriptions[scope]}
                      </span>
                    </Checkbox>
                  ),
                )}
              </div>
              {consentError ? (
                <Typography
                  type={TypographyType.Callout}
                  className="text-accent-ketchup-default"
                >
                  {consentError}
                </Typography>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant={ButtonVariant.Primary}
                    onClick={() => onConsent(true)}
                    loading={isSubmitting}
                    disabled={!client}
                  >
                    Allow
                  </Button>
                  <Button
                    variant={ButtonVariant.Float}
                    onClick={() => onConsent(false)}
                    disabled={isSubmitting}
                  >
                    Deny
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
};

OAuthConsentPage.layoutProps = { seo: { ...noindexSeoProps } };

export default OAuthConsentPage;
