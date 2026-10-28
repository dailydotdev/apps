import { useCallback, useEffect, useMemo, useState } from 'react';
import { markdownToHtmlBasic } from '../../../lib/markdownConversion';
import type { TextFormCover } from './TextForm';

const hashFile = async (file: File): Promise<string | undefined> => {
  if (!globalThis.crypto?.subtle) {
    return undefined;
  }

  try {
    const content = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
    const hash = await crypto.subtle.digest('SHA-256', content);
    return Array.from(new Uint8Array(hash), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
  } catch {
    return undefined;
  }
};

export const useDuplicateCover = ({
  body,
  cover,
}: {
  body: string;
  cover?: TextFormCover | null;
}) => {
  const [coverHash, setCoverHash] = useState<string>();
  const [images, setImages] = useState<{ hash: string; url: string }[]>([]);

  useEffect(() => {
    let canceled = false;
    setCoverHash(undefined);
    if (cover?.file) {
      hashFile(cover.file).then((hash) => {
        if (!canceled) {
          setCoverHash(hash);
        }
      });
    }
    return () => {
      canceled = true;
    };
  }, [cover?.file]);

  const onImageUpload = useCallback(async (file: File, url: string) => {
    const hash = await hashFile(file);
    if (hash) {
      setImages((previous) => [...previous, { hash, url }]);
    }
  }, []);

  const isDuplicateCover = useMemo(() => {
    if (!coverHash || !images.length) {
      return false;
    }
    const doc = new DOMParser().parseFromString(
      markdownToHtmlBasic(body),
      'text/html',
    );
    const sources = new Set(
      Array.from(doc.querySelectorAll('img[src]'), (image) =>
        image.getAttribute('src'),
      ),
    );
    return images.some(
      ({ hash, url }) => hash === coverHash && sources.has(url),
    );
  }, [body, coverHash, images]);

  return { isDuplicateCover, onImageUpload };
};
