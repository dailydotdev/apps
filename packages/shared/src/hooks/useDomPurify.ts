import { useEffect, useState, useMemo } from 'react';
import createDOMPurify from 'dompurify';

export const useDomPurify = (): DOMPurify.DOMPurifyI => {
  const [purify, setPurify] = useState<DOMPurify.DOMPurifyI>();

  useEffect(() => {
    setPurify(createDOMPurify(globalThis.window));
  }, []);

  return purify;
};

type PurifyObject = Record<string, string | Node>;

interface UseObjectPurifyOptionalProps<T extends PurifyObject> {
  filters?: (keyof T)[];
  defaultValue?: Record<keyof T, string>;
}

type UseObjectPurify<T extends PurifyObject> = T & {
  isReady: boolean;
};

export const useObjectPurify = <T extends PurifyObject>(
  obj: T,
  props: UseObjectPurifyOptionalProps<T> = {},
): UseObjectPurify<T> => {
  const { filters = [], defaultValue } = props;
  const [purify, setPurify] = useState<DOMPurify.DOMPurifyI>();

  useEffect(() => {
    setPurify(createDOMPurify(globalThis.window));
  }, []);

  const reduced = (keys: (keyof T)[]) =>
    keys.reduce(
      (result, key) => ({
        ...result,
        [key]: purify?.sanitize?.(obj[key]) ?? defaultValue?.[key] ?? '',
      }),
      { isReady: !!purify } as UseObjectPurify<T>,
    );

  return useMemo(() => {
    if (filters.length === 0) {
      return reduced(Object.keys(obj));
    }

    return reduced(filters);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purify, obj, props]);
};
