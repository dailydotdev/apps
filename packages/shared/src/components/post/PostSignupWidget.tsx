import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostSignupWidget } from '../../lib/featureManagement';
import { AuthTriggers } from '../../lib/auth';
import { SignupWidget } from '../auth/SignupWidget';

export function PostSignupWidget(): ReactElement | null {
  const { user, isAuthReady } = useAuthContext();
  const shouldEvaluate = isAuthReady && !user;
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePostSignupWidget,
    shouldEvaluate,
  });

  if (!shouldEvaluate || !isEnabled) {
    return null;
  }

  return (
    <SignupWidget
      title="Want your personalized dev feed?"
      description="Millions of developers rely on daily.dev for tech news, tools, and discussions that actually matter."
      trigger={AuthTriggers.PostPage}
    />
  );
}
