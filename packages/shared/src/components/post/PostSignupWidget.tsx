import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostSignupWidget } from '../../lib/featureManagement';
import { AuthTriggers } from '../../lib/auth';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import AuthOptions from '../auth/AuthOptions';
import { AuthDisplay } from '../auth/common';

const gradientStyle: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, var(--theme-accent-cabbage-default) 0%, var(--theme-accent-onion-default) 30%, var(--theme-accent-water-default) 60%, var(--theme-accent-cabbage-default) 100%)',
  backgroundSize: '200% auto',
  animation: 'post-signup-gradient-shift 10s ease-in-out infinite',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

export function PostSignupWidget(): ReactElement | null {
  const { user, isAuthReady, showLogin } = useAuthContext();
  const shouldEvaluate = isAuthReady && !user;
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePostSignupWidget,
    shouldEvaluate,
  });

  if (!shouldEvaluate || !isEnabled) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-16 border border-border-subtlest-tertiary p-4">
      <style>
        {`@keyframes post-signup-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }`}
      </style>
      <h3 className="font-bold typo-title3" style={gradientStyle}>
        Want your personalized dev feed?
      </h3>
      <p className="mt-2 text-text-tertiary typo-footnote">
        Millions of developers rely on daily.dev for tech news, tools, and
        discussions that actually matter.
      </p>
      <div className="mt-4">
        <AuthOptions
          ignoreMessages
          formRef={null as unknown as React.MutableRefObject<HTMLFormElement>}
          trigger={AuthTriggers.PostPage}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          className={{
            onboardingSignup: '!gap-3',
          }}
          onAuthStateUpdate={(props) => {
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: { isLogin: true, formValues: props },
            });
          }}
          onboardingSignupButton={{
            variant: ButtonVariant.Primary,
            size: ButtonSize.Medium,
          }}
          hideLoginLink
          compact
        />
      </div>
    </div>
  );
}
