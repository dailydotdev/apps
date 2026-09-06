import type { ReactElement } from 'react';
import React from 'react';
import HijackingLoginStrip from './HijackingLoginStrip';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';

// The extension's cover arm sells the new tab; the explore hub sells the feed
// the visitor is already browsing.
const copy = {
  heading: 'Make this your feed.',
  body: 'Sign up and daily.dev keeps the topics, sources, and discussions you care about in one place.',
};

// The new tab's hijacking strip on the Explore hub's pages, which are where
// search engines land logged-out visitors. It runs the same experiment arm as
// the new tab; members already have the feed it offers, so it renders for
// anonymous visitors only.
export function ExploreSignupStrip({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const { shouldShowAuthBanner } = useOnboardingActions();

  if (!shouldShowAuthBanner) {
    return null;
  }

  return <HijackingLoginStrip copy={copy} className={className} />;
}
