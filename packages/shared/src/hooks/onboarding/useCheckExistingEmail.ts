import type React from 'react';
import { useState } from 'react';
import { getFormEmail } from '../../components/auth/common';

interface UseCheckExistingEmailProps {
  onAfterEmailCheck?: (exists: boolean) => unknown;
  onBeforeEmailCheck?: (email: string) => unknown;
  onValidEmail?: (email: string) => unknown;
}

export interface UseCheckExistingEmail {
  email: {
    value: string;
    alreadyExists: boolean;
    isCheckPending: boolean;
  };
  onEmailCheck: (e: React.FormEvent) => Promise<{
    emailExists: boolean;
    emailValue: string;
  } | null>;
}

export const useCheckExistingEmail = ({
  onAfterEmailCheck,
  onBeforeEmailCheck,
  onValidEmail,
}: UseCheckExistingEmailProps): UseCheckExistingEmail => {
  const [emailToCheck, setEmailToCheck] = useState<string>('');
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);

  const onEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = getFormEmail(e);
    if (!emailValue) {
      return null;
    }

    onBeforeEmailCheck?.(emailValue);
    onValidEmail?.(emailValue);
    onAfterEmailCheck?.(false);
    setEmailAlreadyExists(false);
    setEmailToCheck('');
    return { emailExists: false, emailValue };
  };

  return {
    email: {
      alreadyExists: emailAlreadyExists,
      isCheckPending: false,
      value: emailToCheck,
    },
    onEmailCheck,
  };
};
