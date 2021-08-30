import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

const getVersion = (query: ParsedUrlQuery): string | undefined => {
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
    if (Object.keys(query).length > 0 && !version) {
      setVersion(getVersion(query));
    }
  }, [query, version]);

  return version;
}
