import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { Dispatch, useContext, useEffect, useMemo, useState } from 'react';
import useTopSites from './useTopSites';

interface UseShortcutLinks {
  askTopSitesPermission: () => Promise<boolean>;
  revokePermission: () => Promise<unknown>;
  onIsManual: Dispatch<boolean>;
  onUpdateShortcutLinks: Dispatch<string[]>;
  resetSelected: () => unknown;
  hasCheckedPermission?: boolean;
  isTopSiteActive?: boolean;
  hasTopSites?: boolean;
  isManual?: boolean;
  shortcutLinks: string[];
  formLinks: string[];
}

export default function useShortcutLinks(): UseShortcutLinks {
  const [isManual, setIsManual] = useState(true);
  const { customLinks } = useContext(SettingsContext);
  const [localLinks, setLocalLinks] = useState(customLinks || []);
  const {
    topSites,
    hasCheckedPermission,
    revokePermission,
    askTopSitesPermission,
  } = useTopSites();
  const hasTopSites = topSites === undefined ? null : topSites?.length > 0;
  const hasCustomLinks = customLinks?.length > 0;
  const isTopSiteActive =
    hasCheckedPermission && !hasCustomLinks && hasTopSites;
  const sites = topSites?.map((site) => site.url);
  const shortcutLinks = isTopSiteActive ? sites : customLinks;
  const formLinks = isManual ? localLinks : sites;

  const resetSelected = () => {
    if (topSites !== undefined) {
      setIsManual(false);
    } else {
      setIsManual(true);
    }
  };

  useEffect(() => {
    if (hasCheckedPermission) {
      resetSelected();
    }
  }, [hasCheckedPermission]);

  const onRemokePermission = async () => {
    await revokePermission();

    setIsManual(true);
  };

  return useMemo(
    () => ({
      isManual,
      formLinks,
      shortcutLinks,
      hasTopSites,
      isTopSiteActive,
      hasCheckedPermission,
      askTopSitesPermission,
      resetSelected,
      onIsManual: setIsManual,
      revokePermission: onRemokePermission,
      onUpdateShortcutLinks: setLocalLinks,
    }),
    [
      isManual,
      formLinks,
      shortcutLinks,
      hasTopSites,
      isTopSiteActive,
      hasCheckedPermission,
      askTopSitesPermission,
      resetSelected,
      setIsManual,
      onRemokePermission,
      setLocalLinks,
    ],
  );
}
