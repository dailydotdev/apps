import browser, { TopSites } from 'webextension-polyfill';
import { useEffect, useMemo, useState } from 'react';

type TopSite = TopSites.MostVisitedURL;
export type UseTopSitesRet = {
  topSites: TopSite[] | undefined;
  hasCheckedPermission: boolean;
  revokePermission: () => Promise<unknown>;
  askTopSitesPermission: () => Promise<boolean>;
};

export default function useTopSites(): UseTopSitesRet {
  const [topSites, setTopSites] = useState<TopSite[] | undefined>([]);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const revokePermission = async () => {
    await browser.permissions.remove({
      permissions: ['topSites'],
    });

    setTopSites(undefined);
  };

  const getTopSites = async (): Promise<void> => {
    try {
      setTopSites((await browser.topSites.get()).slice(0, 8));
    } catch (err) {
      setTopSites(undefined);
    }
    setHasCheckedPermission(true);
  };

  // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const askTopSitesPermission = async (): Promise<boolean> => {
    const granted = await browser.permissions.request({
      permissions: ['topSites'],
    });
    if (granted) {
      await getTopSites();
    }
    return granted;
  };

  useEffect(() => {
    getTopSites();
  }, []);

  return useMemo(
    () => ({
      topSites,
      hasCheckedPermission,
      revokePermission,
      askTopSitesPermission,
    }),
    [topSites, hasCheckedPermission, revokePermission, askTopSitesPermission],
  );
}
