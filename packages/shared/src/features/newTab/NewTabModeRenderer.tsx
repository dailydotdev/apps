import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { isSessionActive, useFocusSession } from './store/focusSession.store';
import { FocusSession } from './focus/FocusSession';
import styles from './NewTabModeRenderer.module.css';

interface NewTabModeRendererProps {
  // Rendered when `mode === 'discover'`. Typically the heavy feed layout.
  children: ReactNode;
  // Optional shortcuts slot. Kept in the API to avoid churn; unused now that
  // Zen is gone, but leaving it lets callers pass shortcuts unconditionally.
  shortcuts?: ReactNode;
  className?: string;
}

// Single source of truth for how a chosen new-tab mode maps to the visible
// main area. Both the extension and the webapp route through here so
// switching modes reliably changes what the user sees.
//
// The main feed stays mounted by default. Focus only takes over while a real
// focus session is running or while its completion recap is waiting to be
// dismissed; active hours control extension pause/redirect behavior instead
// of replacing the feed with the "Ready to focus?" picker.
export const NewTabModeRenderer = ({
  children,
  className,
}: NewTabModeRendererProps): ReactElement => {
  const { session } = useFocusSession();
  const showFocus = isSessionActive(session) || session.completedAt !== null;

  return (
    <div
      // `key` forces React to mount a fresh subtree on mode switch so the
      // fade-in always plays from 0 -> 1 and stale refs don't linger.
      key={showFocus ? 'focus' : 'discover'}
      className={classNames(styles.fadeIn, className)}
    >
      {showFocus ? <FocusSession /> : children}
    </div>
  );
};
