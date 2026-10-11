import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useIsPhone } from '../../hooks/useViewSize';
import type { RowItem } from './ShellRow';

const tabParam = 'tab';

const toSlug = (tab: string): string => tab.toLowerCase().replace(/\s+/g, '-');

interface QueryTab<T extends string> {
  activeTab: T;
  /** False until the router has read the query; hold tab content until then. */
  isTabKnown: boolean;
  setActiveTab: (tab: T) => void;
  segments: RowItem[];
}

// On a phone every segment has an address: the open tab rides in ?tab= (the
// first tab is the bare address), so a reload, a shared link and back from
// the next page all land on it. Wider screens keep later switches in state
// but open on the tab a link names.
// `isAddressed` is off where a route change would trip an exit prompt.
export const useQueryTab = <T extends string>(
  tabs: readonly T[],
  { isAddressed = true }: { isAddressed?: boolean } = {},
): QueryTab<T> => {
  const router = useRouter();
  const isPhone = useIsPhone();
  const [localTab, setLocalTab] = useState<T>();
  const fromQuery = isPhone && isAddressed;
  const queryTab = router?.query?.[tabParam];
  const addressedTab = isAddressed
    ? tabs.find((tab) => toSlug(tab) === queryTab)
    : undefined;
  const activeTab = fromQuery
    ? addressedTab ?? tabs[0]
    : localTab ?? addressedTab ?? tabs[0];

  const setActiveTab = useCallback(
    (tab: T) => {
      if (!fromQuery) {
        setLocalTab(tab);
        return;
      }

      const [path, search = ''] = router.asPath.split('#')[0].split('?');
      const params = new URLSearchParams(search);

      if (tab === tabs[0]) {
        params.delete(tabParam);
      } else {
        params.set(tabParam, toSlug(tab));
      }

      const query = params.toString();
      router.replace(query ? `${path}?${query}` : path, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [fromQuery, router, tabs],
  );

  const segments = tabs.map((tab) => ({
    key: tab,
    label: tab,
    active: tab === activeTab,
    onClick: () => setActiveTab(tab),
  }));

  const isTabKnown = !isAddressed || router?.isReady !== false;

  return { activeTab, isTabKnown, setActiveTab, segments };
};
