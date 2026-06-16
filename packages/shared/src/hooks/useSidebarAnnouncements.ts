import { useMemo } from 'react';
import { usePersistentState } from './usePersistentState';
import { SIDEBAR_ANNOUNCEMENTS } from '../components/announcements/content';
import type { AnnouncementItem } from '../components/announcements/types';

const DISMISSED_STORAGE_KEY = 'sidebar_announcements_dismissed';

interface UseSidebarAnnouncements {
  items: AnnouncementItem[];
  dismiss: (id: string) => void;
  // True once the persisted dismissal list has hydrated — gate rendering on
  // this so dismissed cards never flash on load.
  isReady: boolean;
}

export const useSidebarAnnouncements = (): UseSidebarAnnouncements => {
  const [dismissed, setDismissed, loaded] = usePersistentState<string[]>(
    DISMISSED_STORAGE_KEY,
    [],
  );

  const items = useMemo(() => {
    if (!loaded) {
      return [];
    }

    const dismissedSet = new Set(dismissed);
    return SIDEBAR_ANNOUNCEMENTS.filter((item) => !dismissedSet.has(item.id));
  }, [dismissed, loaded]);

  const dismiss = (id: string): void => {
    if (dismissed.includes(id)) {
      return;
    }

    setDismissed([...dismissed, id]);
  };

  return { items, dismiss, isReady: loaded };
};
