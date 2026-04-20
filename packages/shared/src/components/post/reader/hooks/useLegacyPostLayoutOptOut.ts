import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY_LEGACY_OPT_OUT = 'readerModal.legacyOptOut';
const OPT_OUT_EVENT = 'readerModal:legacyOptOutChanged';

function readOptOut(): boolean {
  if (typeof globalThis.window === 'undefined') {
    return false;
  }

  try {
    return (
      globalThis.window.localStorage.getItem(STORAGE_KEY_LEGACY_OPT_OUT) === '1'
    );
  } catch {
    return false;
  }
}

export function useLegacyPostLayoutOptOut(): {
  isOptedOut: boolean;
  optOut: () => void;
} {
  const [isOptedOut, setOptedOut] = useState<boolean>(readOptOut);

  useEffect(() => {
    if (typeof globalThis.window === 'undefined') {
      return undefined;
    }

    const onChange = () => setOptedOut(readOptOut());
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY_LEGACY_OPT_OUT) {
        return;
      }
      onChange();
    };

    globalThis.window.addEventListener('storage', onStorage);
    globalThis.window.addEventListener(OPT_OUT_EVENT, onChange);
    return () => {
      globalThis.window.removeEventListener('storage', onStorage);
      globalThis.window.removeEventListener(OPT_OUT_EVENT, onChange);
    };
  }, []);

  const optOut = useCallback(() => {
    try {
      globalThis.window?.localStorage.setItem(STORAGE_KEY_LEGACY_OPT_OUT, '1');
    } catch {
      // ignore quota / private mode errors – we'll still flip state below
    }
    setOptedOut(true);
    globalThis.window?.dispatchEvent(new Event(OPT_OUT_EVENT));
  }, []);

  return { isOptedOut, optOut };
}
