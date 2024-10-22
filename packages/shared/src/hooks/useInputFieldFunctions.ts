import { SyntheticEvent, useEffect, useState, useCallback } from 'react';
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

  const checkValidity = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    const isValid = inputRef.current.checkValidity();
    if (validInput !== isValid) {
      setValidInput(isValid);
      validityChanged?.(isValid);
    }
  }, [inputRef, validInput, validityChanged]);

  useEffect(() => {
    if (inputRef.current?.value) {
      setInputLength(inputRef.current.value.length);
      checkValidity();
    }
  }, [inputRef, checkValidity]);

  useEffect(() => {
    if (validInput !== undefined && valid !== undefined) {
      setValidInput(valid);
    }
  }, [valid, validInput]);

  const onInput = (event: SyntheticEvent<T, InputEvent>): void => {
    baseOnInput(event);
    if (valueChanged) {
      valueChanged(event.currentTarget.value);
    }
    const len = event.currentTarget.value.length;
    setInputLength(len);
    checkValidity();
  };

  const onBlur = () => {
    baseOnBlur();
    if (inputRef.current) {
      checkValidity();
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
