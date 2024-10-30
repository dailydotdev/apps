import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import useDebounceFn from './useDebounceFn';
import {
  UseInputField,
  useInputField,
  ValidInputElement,
} from './useInputField';

export interface InputFieldFunctionsProps {
  value?: string | ReadonlyArray<string> | number | undefined;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
}

interface UseInputFieldFunctions<T extends ValidInputElement = HTMLInputElement>
  extends UseInputField<T> {
  inputLength: number | undefined;
  validInput?: boolean;
}

function useInputFieldFunctions<
  T extends ValidInputElement = HTMLInputElement,
>({
  value,
  valid,
  valueChanged,
  validityChanged,
}: InputFieldFunctionsProps = {}): UseInputFieldFunctions<T> {
  const {
    inputRef,
    focused,
    hasInput,
    onFocus,
    onBlur: baseOnBlur,
    onInput: baseOnInput,
    focusInput,
    setInput,
  } = useInputField<T>(value, valueChanged);
  const [inputLength, setInputLength] = useState<number>(undefined);
  const [validInput, setValidInput] = useState<boolean>(undefined);
  const validInputRef = useRef<boolean>(undefined);
  const [idleTimeout, clearIdleTimeout] = useDebounceFn(() => {
    setValidInput(inputRef.current.checkValidity());
  }, 500);

  useEffect(() => {
    if (inputRef.current?.value) {
      setInputLength(inputRef.current.value.length);
      const inputValidity = inputRef.current.checkValidity();
      if (inputValidity) {
        setValidInput(true);
      }
    }
  }, [inputRef]);

  const onInput = (event: SyntheticEvent<T, InputEvent>): void => {
    clearIdleTimeout();
    baseOnInput(event);
    if (valueChanged) {
      valueChanged(event.currentTarget.value);
    }
    const len = event.currentTarget.value.length;
    setInputLength(len);
    const inputValidity = inputRef.current.checkValidity();

    if (inputValidity) {
      setValidInput(true);
    } else {
      idleTimeout();
    }
  };

  useEffect(() => {
    if (validInput !== undefined) {
      validityChanged?.(validInput);
      validInputRef.current = validInput;
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validInput]);

  useEffect(() => {
    if (validInputRef.current !== undefined && valid !== undefined) {
      setValidInput(valid);
    }
  }, [valid]);

  const onBlur = () => {
    clearIdleTimeout();
    baseOnBlur();
    if (inputRef.current) {
      setValidInput(inputRef.current.checkValidity());
    }
  };

  return {
    inputLength,
    inputRef,
    focused,
    hasInput,
    validInput,
    onFocus,
    onBlur,
    onInput,
    focusInput,
    setInput,
  };
}

export default useInputFieldFunctions;
