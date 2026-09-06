import type { ReactElement } from 'react';
import React from 'react';
import { HijackingHeroStrip } from './HijackingLoginStrip';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import { HijackingVariant } from '../../lib/featureManagement';

// The extension's arms sell the new tab; the explore hub sells the feed the
// visitor is already browsing.
const copy = {
  heading: 'Make this your feed.',
  body: 'Sign up and daily.dev keeps the topics, sources, and discussions you care about in one place.',
};

// The new tab's hijacking strip on the Explore hub's pages, which are where
// search engines land logged-out visitors. This is organic public traffic, not
// the new-tab experiment's population, so it is not enrolled in
// `hijacking_variants3`: it renders the arm that experiment settled on, for
// anonymous visitors only — members already have the feed it offers.
export function ExploreSignupStrip({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const { shouldShowAuthBanner } = useOnboardingActions();

  if (!shouldShowAuthBanner) {
    return null;
  }

  return (
    <HijackingHeroStrip
      variant={HijackingVariant.CTA}
      copy={copy}
      className={className}
    />
  );
}
