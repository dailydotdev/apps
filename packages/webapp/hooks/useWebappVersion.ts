import { useEffect, useState } from 'react';
import type { ParsedUrlQuery } from 'querystring';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { useRouterQuery } from '@dailydotdev/shared/src/features/common/hooks/useRouterQuery';

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
  const { query } = useRouterQuery();
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    if (!version) {
      setVersion(getVersion(query));
    }
  }, [query, version]);

  return version;
}
