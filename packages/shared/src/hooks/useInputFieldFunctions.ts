import type { SyntheticEvent } from 'react';
import { useEffect, useState } from 'react';
import useDebounceFn from './useDebounceFn';
import type { UseInputField, ValidInputElement } from './useInputField';
import { useInputField } from './useInputField';

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
  } = useInputField<T>(
    value as string | number | readonly string[],
    valueChanged,
  );
  const [inputLength, setInputLength] = useState<number | undefined>(undefined);
  const [validInput, setValidInput] = useState<boolean | undefined>(undefined);
  const [idleTimeout, clearIdleTimeout] = useDebounceFn(() => {
    setValidInput(inputRef.current?.checkValidity());
  }, 500);

  useEffect(() => {
    const input = inputRef.current;
    if (input?.value) {
      setInputLength(input.value.length);
      if (input.checkValidity()) {
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
    const inputValidity = inputRef.current?.checkValidity();

    if (inputValidity) {
      setValidInput(true);
    } else {
      idleTimeout();
    }
  };

  useEffect(() => {
    if (validInput !== undefined) {
      validityChanged?.(validInput);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validInput]);

  // An externally-controlled `valid` prop is authoritative whenever it is
  // provided. Reflect `valid=true` immediately, but only surface an invalid
  // state once the field actually has content: a pristine, untouched field that
  // is technically invalid (e.g. required + empty, or a value-derived
  // `valid={!!x}` / `valid={value.length > 0}`) must not flash a red border
  // before the user types. Server-side and submit errors arrive with content,
  // so they still show right away.
  useEffect(() => {
    if (valid === undefined) {
      return;
    }
    if (valid === false && !inputRef.current?.value) {
      return;
    }
    setValidInput(valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, hasInput]);

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
