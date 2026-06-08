import type { MutableRefObject, ReactElement } from 'react';
import React from 'react';
import AuthOptions from '../../components/auth/AuthOptions';
import { AuthDisplay } from '../../components/auth/common';
import { AuthTriggers } from '../../lib/auth';
import { ButtonSize, ButtonVariant } from '../../components/buttons/Button';
import { useBuildFeedSignup } from './useBuildFeedSignup';
import type { BuildFeedSignupOrigin } from './useBuildFeedSignup';

interface BuildFeedAuthOptionsProps {
  tags: string[];
  origin: BuildFeedSignupOrigin;
  className?: string;
  hideLoginLink?: boolean;
}

/**
 * Inline signup (Google / GitHub / email) reused across the anonymous
 * build-feed surfaces. One-tap social signs up in place; the email path
 * escalates to the modal. Either way the followed topics are applied to the
 * new feed.
 */
export const BuildFeedAuthOptions = ({
  tags,
  origin,
  className,
  hideLoginLink = false,
}: BuildFeedAuthOptionsProps): ReactElement => {
  const { getAuthStateHandler, applyFollowedTags } = useBuildFeedSignup();

  return (
    <AuthOptions
      ignoreMessages
      formRef={null as unknown as MutableRefObject<HTMLFormElement>}
      trigger={AuthTriggers.PostPage}
      simplified
      defaultDisplay={AuthDisplay.OnboardingSignup}
      forceDefaultDisplay
      className={{ onboardingSignup: className ?? '!gap-3' }}
      onAuthStateUpdate={getAuthStateHandler(tags, origin)}
      onSuccessfulRegistration={() => applyFollowedTags(tags)}
      onboardingSignupButton={{
        variant: ButtonVariant.Primary,
        size: ButtonSize.Medium,
      }}
      hideLoginLink={hideLoginLink}
      compact
    />
  );
};
