import { useEffect, useRef, useState } from 'react';

interface UseTypewriterOptions {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Cycles through words with a type/delete effect — the personal, "alive"
 * touch in the conversion hero (it types out the visitor's own topics).
 * Falls back to the first word instantly when reduced motion is preferred.
 */
export const useTypewriter = (
  words: string[],
  { typeMs = 85, deleteMs = 35, holdMs = 1500 }: UseTypewriterOptions = {},
): string => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (!words.length) {
      return undefined;
    }
    if (reduced.current) {
      setText(words[0]);
      return undefined;
    }

    const current = words[wordIndex % words.length];

    if (!isDeleting && text === current) {
      const timeout = setTimeout(() => setIsDeleting(true), holdMs);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((index) => (index + 1) % words.length);
      return undefined;
    }

    const timeout = setTimeout(
      () => {
        setText((prev) =>
          isDeleting
            ? current.slice(0, prev.length - 1)
            : current.slice(0, prev.length + 1),
        );
      },
      isDeleting ? deleteMs : typeMs,
    );

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typeMs, deleteMs, holdMs]);

  return text;
};
