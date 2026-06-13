import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { isSidebarSettingsPath } from './sidebarCategory';
import { Tooltip } from '../tooltip/Tooltip';
import { SidebarArrowLeft } from '../icons';
import { IconSize } from '../Icon';

const openShortcut = '[';

// "Open sidebar" control surfaced at the left of the feed-area headers while
// the v2 single-panel sidebar is collapsed. The sidebar is collapsed by
// dragging its edge (there's no persistent collapse button), so this is the
// way back open. Self-gates so it only renders when there's a collapsed v2
// sidebar to reopen — a no-op everywhere else.
export const SidebarExpandButton = (): ReactElement | null => {
  const router = useRouter();
  const { isV2 } = useLayoutVariant();
  const { sidebarExpanded, toggleSidebarExpanded } = useSettingsContext();
  const activePage = router?.asPath || router?.pathname || '';

  // `isV2` is already laptop-gated. Settings pages force the panel open, so
  // there's nothing to reopen there.
  if (!isV2 || sidebarExpanded || isSidebarSettingsPath(activePage)) {
    return null;
  }

  return (
    <Tooltip side="bottom" content={`Open sidebar · ${openShortcut}`}>
      <button
        type="button"
        aria-label={`Open sidebar (${openShortcut})`}
        onClick={() => toggleSidebarExpanded()}
        className="focus-outline -ml-1 flex size-8 shrink-0 items-center justify-center rounded-12 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <SidebarArrowLeft
          size={IconSize.Small}
          aria-hidden
          className="rotate-180"
        />
      </button>
    </Tooltip>
  );
};
