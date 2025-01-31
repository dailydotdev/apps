import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';

const getVersion = (query: ParsedUrlQuery): string | undefined => {
  if (isIOSNative()) {
    return 'ios';
  }
  if (query.android) {
    return 'android';
  }
  if (query.pwa) {
    return 'pwa';
  }
  return undefined;
};

export default function useWebappVersion(): string {
  const { query } = useRouter();
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    if (!version) {
      setVersion(getVersion(query));
    }
  }, [query, version]);

  return version;
}
