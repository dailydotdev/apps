import { atom } from 'jotai/vanilla';

export const atomWithLocalStorage = <T>({
  key,
  initialValue,
  parseFunction,
}: {
  key: string;
  initialValue: T;
  parseFunction?: (value: string) => T;
}) => {
  const getInitialValue = () => {
    const item = globalThis?.localStorage?.getItem?.(key) ?? null;
    if (item !== null) {
      const value = JSON.parse(item);
      return parseFunction?.(value) ?? (value as T);
    }
    return initialValue;
  };
  const baseAtom = atom<T>(getInitialValue());
  return atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage?.setItem?.(key, JSON.stringify(nextValue));
    },
  );
};
