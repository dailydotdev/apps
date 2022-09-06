import { MutableRefObject, useMemo, useRef, useState } from 'react';
import { RegistrationFormValues } from '../components/auth/RegistrationForm';
import { CloseModalFunc } from '../components/modals/common';
import { formToJson } from '../lib/form';

interface UseAuthForms {
  onDiscardCancelled: CloseModalFunc;
  onDiscardAttempt: CloseModalFunc;
  onContainerChange: (el: HTMLDivElement) => void;
  container: HTMLDivElement;
  isDiscardOpen: boolean;
  formRef?: MutableRefObject<HTMLFormElement>;
}

interface UseAuthFormsProps {
  onDiscard?: CloseModalFunc;
}

const useAuthForms = ({ onDiscard }: UseAuthFormsProps = {}): UseAuthForms => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>();

  const onDiscardAttempt: CloseModalFunc = (e) => {
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

  const onDiscardCancelled: CloseModalFunc = (e) => {
    e.stopPropagation();
    setIsDiscardOpen(false);
  };

  return useMemo(
    () => ({
      onDiscardAttempt,
      onDiscardCancelled,
      onContainerChange: setContainer,
      container,
      isDiscardOpen,
      formRef,
    }),
    [formRef?.current, container, isDiscardOpen],
  );
};

export default useAuthForms;
