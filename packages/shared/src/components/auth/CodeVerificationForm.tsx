import type { ReactElement } from 'react';
import React from 'react';
import type { CloseModalFunc } from '../modals/common';
import AuthHeader from './AuthHeader';
import type { AuthFormProps } from './common';
import { AuthModalText } from './common';

interface CodeVerificationFormProps extends AuthFormProps {
  initialFlow: string;
  onBack?: CloseModalFunc;
  onSubmit?: () => void;
}

/**
 * Legacy code verification form for password recovery.
 * With BetterAuth, password reset uses a link-based flow instead.
 * This component is kept as a placeholder for backwards compatibility.
 */
function CodeVerificationForm({
  onBack,
  simplified,
}: CodeVerificationFormProps): ReactElement {
  return (
    <>
      <AuthHeader
        simplified={simplified}
        title="Verification"
        onBack={onBack}
      />
      <AuthModalText className="px-14 py-8 text-center">
        Password reset is handled via email link.
      </AuthModalText>
    </>
  );
}

export default CodeVerificationForm;
