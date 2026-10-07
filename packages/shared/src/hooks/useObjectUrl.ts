import { useEffect, useState } from 'react';

/** A URL that shows the blob, revoked once the blob changes or unmounts. */
export const useObjectUrl = (blob?: Blob): string | undefined => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!blob) {
      setUrl(undefined);

      return undefined;
    }

    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
};
