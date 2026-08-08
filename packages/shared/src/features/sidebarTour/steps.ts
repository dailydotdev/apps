import type { SidebarTourStep } from './types';
import { SidebarCategory } from '../../components/sidebar/sidebarCategory';

// The rail's own, already-stable hooks. No new data attributes: every category
// tab renders `id={`sidebar-category-${id}`}`, the shortcuts dock always leads
// with its "Customize shortcuts" button, and the tablist carries its ARIA label.
export const RAIL_TABLIST_SELECTOR =
  '[role="tablist"][aria-label="Sidebar categories"]';
export const DOCK_CUSTOMIZE_SELECTOR =
  'button[aria-label="Customize shortcuts"]';
// A panel row that can be dragged into the dock. `draggable` is set by
// SidebarItem for every v2 row with a path, so the first match is the first
// pinnable row of whichever panel is open.
export const PINNABLE_ROW_SELECTOR =
  '#sidebar-context-panel [draggable="true"]';

export const SIDEBAR_TOUR_STEPS: SidebarTourStep[] = [
  {
    id: 'rail',
    message: 'Your navigation moved into this rail, and panels open on hover.',
    target: RAIL_TABLIST_SELECTOR,
    extra: 'compactSwitch',
  },
  {
    id: 'dock',
    message:
      'Drag anything from the sidebar into the dock, or add it from the ••• menu.',
    target: DOCK_CUSTOMIZE_SELECTOR,
  },
  {
    id: 'gameCenter',
    message: 'Your streak and quests now share one Game Center.',
    target: `#sidebar-category-${SidebarCategory.GameCenter}`,
    extra: 'gameCenterPanel',
  },
];

// A step whose target isn't on screen is dropped rather than pointed blind at
// the wrong part of the rail, so the tour can legitimately be two steps for a
// user with gamification off or a viewport too short for the dock. The progress
// ring counts what's left.
export const resolveSidebarTourSteps = (): SidebarTourStep[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  return SIDEBAR_TOUR_STEPS.filter(
    (step) => !!document.querySelector(step.target),
  );
};
