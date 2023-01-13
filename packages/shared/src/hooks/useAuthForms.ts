import React, { MutableRefObject, useMemo, useRef, useState } from 'react';
import { PromptOptions, usePrompt } from './usePrompt';

export type CloseAuthModalFunc = (
  e: React.MouseEvent | React.KeyboardEvent | React.FormEvent,
  forceClose?: boolean,
) => void;

interface UseAuthForms {
  onDiscardAttempt: CloseAuthModalFunc;
  onContainerChange: (el: HTMLDivElement) => void;
  container: HTMLDivElement;
  formRef?: MutableRefObject<HTMLFormElement>;
}

interface UseAuthFormsProps {
  onDiscard?: CloseAuthModalFunc;
}

const useAuthForms = ({ onDiscard }: UseAuthFormsProps = {}): UseAuthForms => {
  const [container, setContainer] = useState<HTMLDivElement>();
  const { showPrompt } = usePrompt();
  const formRef = useRef<HTMLFormElement>();

  const openPrompt = async (e) => {
    const options: PromptOptions = {
      title: 'Discard changes?',
      description: 'If you leave your changes will not be saved',
      okButton: {
        title: 'Leave',
        className: 'btn-primary-cabbage',
      },
      cancelButton: {
        title: 'Stay',
        className: 'btn-secondary',
      },
      className: {
        buttons: 'flex-row-reverse',
      },
    };
    if (await showPrompt(options)) {
      onDiscard(e);
    }
  };

  const onDiscardAttempt: CloseAuthModalFunc = (e, forceClose = false) => {
    if (forceClose || !formRef?.current) {
      return onDiscard(e, forceClose);
    }
    return openPrompt(e);
  };

  return useMemo(
    () => ({
      onDiscardAttempt,
      onContainerChange: setContainer,
      container,
      formRef,
    }),
    [formRef?.current, container, onDiscard],
  );
};

export default useAuthForms;
