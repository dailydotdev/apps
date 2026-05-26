import { useEffect, useRef } from 'react';

// Toggles `.card-action-content` wrappers via DOM mutation; paired
// with the `.btn-v2:has(> .card-action-content.hidden)` rule in
// buttons-v2.css that collapses padding and locks aspect-ratio to 1:1.
export const usePostActionsLabelVisibility = (): {
  ref: React.RefObject<HTMLDivElement>;
} => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const adjustActions = () => {
      const wrappers = el.querySelectorAll<HTMLElement>('.card-action-content');
      wrappers.forEach((w) => w.classList.remove('hidden'));
      if (el.scrollWidth > el.clientWidth) {
        wrappers.forEach((w) => w.classList.add('hidden'));
      }
    };
    const ro = new ResizeObserver(() => adjustActions());
    ro.observe(el);
    adjustActions();
    return () => ro.disconnect();
  }, []);

  return { ref };
};
