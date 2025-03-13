import type React from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLogContext } from '../../contexts/LogContext';
import { checkKratosEmail } from '../../lib/kratos';
import { AuthEventNames } from '../../lib/auth';
import { getFormEmail } from '../../components/auth/common';
import type { AuthTriggersType } from '../../lib/auth';

interface UseCheckExistingEmailProps {
  onSignup?: (email: string) => unknown;
  targetId?: string;
  trigger: AuthTriggersType;
}

export interface UseCheckExistingEmail {
  email: {
    value: string;
    alreadyExists: boolean;
    isCheckPending: boolean;
  };
  onEmailSignup: (e: React.FormEvent) => Promise<{
    emailExists: boolean;
    emailValue: string;
  } | null>;
}

export const useCheckExistingEmail = ({
  onSignup,
  targetId,
  trigger,
}: UseCheckExistingEmailProps): UseCheckExistingEmail => {
  const [shouldLogin, setShouldLogin] = useState(false);
  const [registerEmail, setRegisterEmail] = useState<string>(null);
  const { logEvent } = useLogContext();
  const { mutateAsync: checkEmail, isPending: isCheckPending } = useMutation({
    mutationFn: (emailParam: string) => checkKratosEmail(emailParam),
    onSuccess: (res, emailValue) => {
      const emailExists = !!res?.result;

      setShouldLogin(emailExists);
      logEvent({
        event_name: emailExists
          ? AuthEventNames.OpenLogin
          : AuthEventNames.OpenSignup,
        extra: JSON.stringify({ trigger }),
        target_id: targetId,
      });

      if (emailExists) {
        setRegisterEmail(emailValue);
        return null;
      }

      return onSignup(emailValue);
    },
  });

  const onEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = getFormEmail(e);
    if (isCheckPending || !emailValue) {
      return null;
    }

    logEvent({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: 'email',
      extra: JSON.stringify({ trigger }),
    });

    const res = await checkEmail(emailValue);
    const emailExists = !!res?.result;
    return { emailExists, emailValue };
  };

  return {
    email: {
      alreadyExists: shouldLogin,
      isCheckPending,
      value: registerEmail,
    },
    onEmailSignup,
  };
};
