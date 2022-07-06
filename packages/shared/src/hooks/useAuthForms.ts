import { MutableRefObject, useMemo, useRef, useState } from 'react';
import {
  RegistrationFormValues,
  SocialProviderAccount,
} from '../components/auth/RegistrationForm';
import { CloseModalFunc } from '../components/modals/common';
import { formToJson } from '../lib/form';

interface UseAuthForms {
  onDiscardCancelled: CloseModalFunc;
  onDiscardAttempt: CloseModalFunc;
  onContainerChange: (el: HTMLDivElement) => void;
  onSocialProviderChange: (account: SocialProviderAccount) => void;
  container: HTMLDivElement;
  isDiscardOpen: boolean;
  socialAccount?: SocialProviderAccount;
  formRef?: MutableRefObject<HTMLFormElement>;
}

interface UseAuthFormsProps {
  onDiscard: CloseModalFunc;
}

const useAuthForms = ({ onDiscard }: UseAuthFormsProps): UseAuthForms => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [socialAccount, setSocialAccount] = useState<SocialProviderAccount>();
  const formRef = useRef<HTMLFormElement>();

  const onDiscardAttempt: CloseModalFunc = (e) => {
    if (!formRef?.current) {
      return onDiscard(e);
    }

    if (socialAccount) {
      return onDiscard(e);
    }

    const { email: emailAd, ...rest } = formToJson<RegistrationFormValues>(
      formRef.current,
      {},
    );
    const values = Object.values(rest);

    if (values.some((value) => !!value)) {
      return setIsDiscardOpen(true);
    }

    return onDiscard(e);
  };

  const onDiscardCancelled: CloseModalFunc = (e) => {
    e.stopPropagation();
    setIsDiscardOpen(false);
  };

  return useMemo(
    () => ({
      onDiscardAttempt,
      onDiscardCancelled,
      onContainerChange: setContainer,
      onSocialProviderChange: setSocialAccount,
      container,
      isDiscardOpen,
      socialAccount,
      formRef,
    }),
    [formRef?.current, container, isDiscardOpen, socialAccount],
  );
};

export default useAuthForms;
