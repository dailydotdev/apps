import React, { MutableRefObject, useMemo, useRef, useState } from 'react';
import { RegistrationFormValues } from '../components/auth/RegistrationForm';
import { formToJson } from '../lib/form';

export type CloseAuthModalFunc = (
  e: React.MouseEvent | React.KeyboardEvent | React.FormEvent,
  forceClose?: boolean,
) => void;

interface UseAuthForms {
  onDiscardCanceled: CloseAuthModalFunc;
  onDiscardAttempt: CloseAuthModalFunc;
  onContainerChange: (el: HTMLDivElement) => void;
  container: HTMLDivElement;
  isDiscardOpen: boolean;
  formRef?: MutableRefObject<HTMLFormElement>;
}

interface UseAuthFormsProps {
  onDiscard?: CloseAuthModalFunc;
}

const useAuthForms = ({ onDiscard }: UseAuthFormsProps = {}): UseAuthForms => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>();

  const onDiscardAttempt: CloseAuthModalFunc = (e, forceClose = false) => {
    if (forceClose) {
      return onDiscard(e);
    }
    if (!formRef?.current) {
      return onDiscard(e);
    }

    const form = formToJson<RegistrationFormValues>(formRef.current);
    const values = Object.values(form);

    if (values.some((value) => !!value)) {
      return setIsDiscardOpen(true);
    }

    return onDiscard(e);
  };

  const onDiscardCanceled: CloseAuthModalFunc = (e) => {
    e.stopPropagation();
    setIsDiscardOpen(false);
  };

  return useMemo(
    () => ({
      onDiscardAttempt,
      onDiscardCanceled,
      onContainerChange: setContainer,
      container,
      isDiscardOpen,
      formRef,
    }),
    [formRef?.current, container, isDiscardOpen],
  );
};

export default useAuthForms;
