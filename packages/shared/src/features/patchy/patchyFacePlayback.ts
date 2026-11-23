import { useEffect, useMemo, useReducer } from 'react';

// An animated image that plays once never restarts when shown again: the
// browser keeps its decoded, finished state per URL. Each play gets its own
// object URL from one download instead, so it starts from the first frame
// without fetching the file again.
const blobs = new Map<string, Blob>();
const loading = new Map<string, Promise<Blob | null>>();

const canPlayFromBlob = (): boolean =>
  typeof fetch === 'function' &&
  typeof URL !== 'undefined' &&
  typeof URL.createObjectURL === 'function';

export const loadPatchyFace = (src: string): Promise<Blob | null> => {
  if (!canPlayFromBlob()) {
    return Promise.resolve(null);
  }
  const cached = blobs.get(src);
  if (cached) {
    return Promise.resolve(cached);
  }
  let pending = loading.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((response) => (response.ok ? response.blob() : null))
      .catch(() => null)
      .then((blob) => {
        loading.delete(src);
        if (blob) {
          blobs.set(src, blob);
        }
        return blob;
      });
    loading.set(src, pending);
  }
  return pending;
};

// The URL to show a face with: a fresh object URL per play for a one-shot
// face once its file is in, else the plain URL.
export const usePatchyFaceUrl = (
  src: string,
  playKey: string,
  isOneShot: boolean,
): string => {
  const [, onLoaded] = useReducer((count: number) => count + 1, 0);
  const blob = isOneShot ? blobs.get(src) : undefined;
  const playUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    // A new play key is a new play: it needs its own URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blob, playKey],
  );

  useEffect(
    () => () => {
      if (playUrl) {
        URL.revokeObjectURL(playUrl);
      }
    },
    [playUrl],
  );

  useEffect(() => {
    if (!isOneShot || blobs.has(src)) {
      return undefined;
    }
    let isCurrent = true;
    loadPatchyFace(src).then((loaded) => {
      if (isCurrent && loaded) {
        onLoaded();
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [src, isOneShot]);

  return playUrl ?? src;
};
