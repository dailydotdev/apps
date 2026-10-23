import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { cloudinaryCharmNoComments } from '../../lib/image';

// X's fade: the page colour from 52%, 45% of it at 84%, clear at the top,
// starting 72px above the footer.
const fadeStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to top, var(--theme-background-default) 52%, color-mix(in srgb, var(--theme-background-default) 45%, transparent) 84%, transparent 100%)',
};

interface Column {
  left: number;
  width: number;
}

/**
 * The post column the footer pins to, found the way X finds its own: the
 * comment section's closest <main>, inside its border (left + clientLeft,
 * clientWidth).
 */
const findColumn = (): HTMLElement | undefined =>
  document.querySelector('[data-comments-teaser]')?.closest('main') ??
  undefined;

const useCommentsColumn = (): Column | undefined => {
  const [column, setColumn] = useState<Column>();

  useEffect(() => {
    const element = findColumn();
    if (!element) {
      return undefined;
    }
    const measure = () => {
      if (!element.clientWidth) {
        return;
      }
      const { left } = element.getBoundingClientRect();
      const next = {
        left: left + element.clientLeft,
        width: element.clientWidth,
      };
      setColumn((current) =>
        current?.left === next.left && current?.width === next.width
          ? current
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return column;
};

/**
 * Laptop and tablet: X's logged-out footer in daily.dev's parts. Centred
 * title, one full-width button (it opens sign-up, where log-in also lives,
 * so there is no second button) and the phone footer's charm pressing it.
 */
export function CommentsTeaserFooter({
  title,
  onContinue,
}: {
  title: string;
  onContinue: () => void;
}): ReactElement | null {
  const column = useCommentsColumn();

  if (!column) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-0 z-3"
      style={{ left: column.left, width: column.width }}
    >
      <div className="relative flex flex-col items-center px-6 pb-6 pt-3 text-center">
        <div
          aria-hidden
          className="animate-teaser-unfurl-y pointer-events-none absolute inset-x-0 -top-[4.5rem] bottom-0 -z-1"
          style={fadeStyle}
        />
        <div className="relative flex h-14 w-full items-end justify-center">
          <h2 className="animate-teaser-blur-rise max-w-[calc(100%-13.25rem)] text-balance pb-3 font-bold tracking-[-0.01em] typo-title3">
            {title}
          </h2>
          {/* MobileAppFooter's charm, unchanged. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 -right-3 h-[3.625rem] w-[6.625rem] overflow-hidden"
          >
            <div className="animate-charm-rise absolute inset-0">
              <div className="animate-charm-press absolute inset-0">
                <img
                  src={cloudinaryCharmNoComments}
                  alt=""
                  className="absolute -top-2.5 left-0 size-[6.625rem] max-w-none"
                />
              </div>
            </div>
          </div>
          <span className="animate-charm-ripple pointer-events-none absolute -bottom-2.5 right-[2.75rem] z-2 size-5 rounded-max bg-accent-cabbage-default opacity-0 blur-sm" />
        </div>
        <div className="animate-teaser-rise relative z-1 w-full">
          <div className="animate-charm-button-press">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.XLarge}
              className="w-full"
              onClick={onContinue}
            >
              Continue to daily.dev
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
