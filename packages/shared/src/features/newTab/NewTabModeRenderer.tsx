import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useNewTabMode } from './store/newTabMode.store';
import { isSessionActive, useFocusSession } from './store/focusSession.store';
import { ZenLayout } from './zen/ZenLayout';
import { FocusSession } from './focus/FocusSession';
import styles from './NewTabModeRenderer.module.css';

interface NewTabModeRendererProps {
  // Rendered when `mode === 'discover'`. Typically the heavy feed layout.
  children: ReactNode;
  // Optional shortcuts slot injected into Zen layout (extension-only; the
  // webapp has no top-sites permission).
  shortcuts?: ReactNode;
  className?: string;
}

// Single source of truth for how a chosen new-tab mode maps to the visible
// main area. Both the extension and the webapp route through here so switching
// modes reliably changes what the user sees — no feature-flag gate, no
// platform-specific branching.
//
// Design note: a subtle cross-fade keyed on the mode name sells the
// transition as intentional rather than flickery. Zen and Focus are already
// self-contained (they don't need the feed grid), so we simply swap the
// subtree.
export const NewTabModeRenderer = ({
  children,
  shortcuts,
  className,
}: NewTabModeRendererProps): ReactElement => {
  const { mode } = useNewTabMode();
  const { session } = useFocusSession();

  // If a focus session is already running when the user lands on the new
  // tab (e.g. re-opened the browser mid-session), snap straight into the
  // focus view regardless of the stored mode. Focus is high-intent; we
  // never want to show Zen or Discover over a live timer.
  const showFocus = mode === 'focus' || isSessionActive(session);

  return (
    <div
      // `key` forces React to mount a fresh subtree on mode switch so the
      // fade-in always plays from 0 -> 1 and stale refs don't linger.
      key={showFocus ? 'focus' : mode}
      className={classNames(styles.fadeIn, className)}
    >
      {showFocus ? <FocusSession /> : null}
      {!showFocus && mode === 'zen' ? (
        <ZenLayout shortcuts={shortcuts} />
      ) : null}
      {!showFocus && mode === 'discover' ? children : null}
    </div>
  );
};
