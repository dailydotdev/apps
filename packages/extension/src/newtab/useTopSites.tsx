import {
  topSites as browserTopSites,
  TopSites,
  permissions,
} from 'webextension-polyfill';
import { useEffect, useState } from 'react';

type TopSite = TopSites.MostVisitedURL;
type UseTopSitesRet = {
  topSites: TopSite[] | undefined;
  askTopSitesPermission: () => Promise<boolean>;
};

export default function useTopSites(): UseTopSitesRet {
  const [topSites, setTopSites] = useState<TopSite[] | undefined>();

  const getTopSites = async (): Promise<void> => {
    try {
      setTopSites((await browserTopSites.get()).slice(0, 8));
    } catch (err) {
      setTopSites(undefined);
    }
  };

  const askTopSitesPermission = async (): Promise<boolean> => {
    const granted = await permissions.request({
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

  return {
    topSites,
    askTopSitesPermission,
  };
}
