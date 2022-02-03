import {
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type ReturnType = {
  focused: boolean;
  hasInput: boolean;
  inputRef: MutableRefObject<HTMLInputElement>;
  onFocus: () => void;
  onBlur: () => void;
  onInput: (event: SyntheticEvent<HTMLInputElement, InputEvent>) => void;
  focusInput: () => void;
  setInput: (newValue: string) => void;
};

export function useInputField(
  value: string | ReadonlyArray<string> | number,
  valueChanged?: (value: string) => void,
): ReturnType {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState<boolean>(false);
  const [hasInput, setHasInput] = useState<boolean>(false);

  const setInput = (newValue: string): void => {
    inputRef.current.value = newValue;
    inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
  };

  useEffect(() => {
    setInput(value?.toString() || '');
  }, [value]);

  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  const onInput = (
    event: SyntheticEvent<HTMLInputElement, InputEvent>,
  ): void => {
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
