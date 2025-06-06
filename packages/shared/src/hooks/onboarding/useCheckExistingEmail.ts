import type React from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { checkKratosEmail } from '../../lib/kratos';
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
  const { mutateAsync: checkEmail, isPending: isCheckPending } = useMutation({
    mutationFn: (emailParam: string) => checkKratosEmail(emailParam),
    onSuccess: (res, emailValue) => {
      const emailExists = !!res?.result;

      setEmailAlreadyExists(emailExists);

      if (emailExists) {
        setEmailToCheck(emailValue);
        return;
      }

      onValidEmail(emailValue);
    },
  });

  const onEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = getFormEmail(e);
    if (isCheckPending || !emailValue) {
      return null;
    }

    onBeforeEmailCheck?.(emailValue);

    const res = await checkEmail(emailValue);
    const emailExists = !!res?.result;

    onAfterEmailCheck?.(emailExists);

    return { emailExists, emailValue };
  };

  return {
    email: {
      alreadyExists: emailAlreadyExists,
      isCheckPending,
      value: emailToCheck,
    },
    onEmailCheck,
  };
};
