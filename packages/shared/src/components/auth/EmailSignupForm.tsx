import React, { ReactElement } from 'react';
import SignupDisclaimer from './SignupDisclaimer';

interface EmailSignupFormProps {
  onSubmit: (e: React.FormEvent) => unknown;
  isReady: boolean;
  showDisclaimer?: boolean;
}

function EmailSignupForm({
  showDisclaimer = true,
}: EmailSignupFormProps): ReactElement {
  return showDisclaimer && <SignupDisclaimer />;
}

export default EmailSignupForm;
