import { useEffect, useRef } from 'react';

/**
 * `usePostActionsLabelVisibility` — `ResizeObserver`-driven label
 * collapse for engagement bars built on `CardAction` / `CardActionBar`.
 *
 * Rationale (preserved verbatim from the v2 button system PR
 * `/dev/buttons` review surface):
 *
 * Why DOM mutation instead of React state: the natural width of the
 * bar changes every time we toggle a label, so a "set state, measure
 * next tick" loop either flickers or gets stuck in icon-only after
 * the first overflow (`ResizeObserver` only fires on the observed
 * element's box-size change, not on content changes). The original
 * v1 production implementation sidesteps that by ALWAYS rendering the
 * labels, then reading `scrollWidth` synchronously after a "force
 * visible" reset and toggling a `hidden` class.
 *
 * Why we target the WRAPPER, not the label span:
 *
 * Hiding `.card-action-label` removed the text but left the outer
 * `<span class="card-action-content …">` in the flex layout. Result:
 * an icon-only `Bookmark` rendered as
 * `px-4 + icon (24) + gap-2 + ghost-wrapper (0) + px-4 = 64 × 40 px`
 * — a rectangle with empty space on the right of the icon. v1 doesn't
 * have this bug because v1's counter / label sits OUTSIDE the
 * `<button>` as a sibling — when the label hides, the button itself
 * has no children at all. v2 brings the affordance inside the click
 * target (Reddit / X pattern), so we have to recreate that "no
 * children" effect on collapse.
 *
 * Hiding `.card-action-content` does exactly that: `display:none`
 * removes the wrapper from the flex layout entirely, so there's no
 * second flex child for `gap-X` to apply between, and the
 * `.btn-v2:has(> .card-action-content.hidden)` rule in
 * `buttons-v2.css` simultaneously zeroes horizontal padding and
 * locks aspect-ratio to 1:1 — collapsing a 40 px-tall comfortable
 * row to a 40 × 40 square hit. Same recipe gives a 32 × 32 square
 * for the compact density.
 *
 * Consumers must pass `labelVisible` for the actions they want to
 * participate — Upvote / Downvote stay icon-only always (no wrapper
 * rendered), the rest opt in.
 */
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
