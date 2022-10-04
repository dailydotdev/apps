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
    if (forceClose || !formRef?.current) {
      return onDiscard(e);
    }
    return setIsDiscardOpen(true);
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
    [formRef?.current, container, isDiscardOpen, onDiscard],
  );
};

export default useAuthForms;
