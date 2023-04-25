import {
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

export type ValidInputElement = HTMLInputElement | HTMLTextAreaElement;

export interface UseInputField<T extends ValidInputElement = HTMLInputElement> {
  focused: boolean;
  hasInput: boolean;
  inputRef: MutableRefObject<T>;
  onFocus: () => void;
  onBlur: () => void;
  onInput: (event: SyntheticEvent<T, InputEvent>) => void;
  focusInput: () => void;
  setInput: (newValue: string) => void;
}

export function useInputField<T extends ValidInputElement = HTMLInputElement>(
  value: string | ReadonlyArray<string> | number,
  valueChanged?: (value: string) => void,
): UseInputField<T> {
  const inputRef = useRef<T>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [hasInput, setHasInput] = useState<boolean>(false);

  const setInput = (newValue: string): void => {
    inputRef.current.value = newValue;
    inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
  };

  useEffect(() => {
    if (value !== undefined) {
      setInput(value?.toString() || '');
      setHasInput(!!inputRef?.current?.value?.length);
    }
  }, [value]);

  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  const onInput = (event: SyntheticEvent<T, InputEvent>): void => {
    if (valueChanged) {
      valueChanged(event.currentTarget.value);
    }
    const len = event.currentTarget.value.length;
    if (!hasInput && len) {
      setHasInput(true);
    } else if (hasInput && !len) {
      setHasInput(false);
    }
  };

  const focusInput = () => {
    inputRef.current.focus();
  };

  return {
    inputRef,
    focused,
    hasInput,
    onFocus,
    onBlur,
    onInput,
    focusInput,
    setInput,
  };
}
