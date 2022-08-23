import React, { FormEvent, ReactElement } from 'react';
import { AccountPageContainer } from '../AccountPageContainer';
import { AccountSecurityDisplay as Display } from '../common';
import EmailForm from '../EmailForm';

interface EmailFormPageProps {
  onSwitchDisplay: (display: Display) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title: string;
}

function EmailFormPage({
  onSwitchDisplay,
  onSubmit,
  title,
}: EmailFormPageProps): ReactElement {
  return (
    <AccountPageContainer
      title={title}
      onBack={() => onSwitchDisplay(Display.Default)}
      className={{ section: 'max-w-sm' }}
    >
      <EmailForm onSubmit={onSubmit} />
    </AccountPageContainer>
  );
}

export default EmailFormPage;
