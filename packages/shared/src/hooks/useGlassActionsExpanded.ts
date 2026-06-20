import usePersistentContext from './usePersistentContext';

const GLASS_ACTIONS_EXPANDED_KEY = 'glass_actions_expanded';

export type UseGlassActionsExpanded = [boolean, (value: boolean) => Promise<void>];

// Per-device preference (IndexedDB, not account-synced) that forces the feed
// card glass action bar to render fully expanded instead of the hover-to-expand
// compact mode. Backed by usePersistentContext so the feed-header toggle and
// every card share the same React Query cache and stay in sync.
export const useGlassActionsExpanded = (): UseGlassActionsExpanded => {
  const [expanded, setExpanded] = usePersistentContext<boolean>(
    GLASS_ACTIONS_EXPANDED_KEY,
    false,
    [true, false],
    false,
  );

  return [expanded, setExpanded];
};
