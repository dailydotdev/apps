import React, { ReactElement } from 'react';
import { AccountPageContainer } from '../AccountPageContainer';
import { AccountSecurityDisplay as Display } from '../common';
import EmailForm, { EmailFormProps } from '../EmailForm';

interface EmailFormPageProps extends EmailFormProps {
  onSwitchDisplay: (display: Display) => void;
  onVerifySuccess: () => Promise<void>;
  title: string;
  verificationId?: string;
}

function EmailFormPage({
  onSwitchDisplay,
  title,
  ...props
}: EmailFormPageProps): ReactElement {
  return (
    <AccountPageContainer
      title={title}
      onBack={() => onSwitchDisplay(Display.Default)}
      className={{ section: 'max-w-sm' }}
    >
      <EmailForm {...props} />
    </AccountPageContainer>
  );
}

export default EmailFormPage;
