import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Browser, TopSites } from 'webextension-polyfill';
import { checkIsExtension } from '../../../lib/func';

type TopSite = TopSites.MostVisitedURL;

export const useTopSites = () => {
  const [browser, setBrowser] = useState<Browser>();
  const [topSites, setTopSites] = useState<TopSite[] | undefined>([]);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  const getTopSites = useCallback(async (): Promise<void> => {
    if (!browser) {
      return;
    }

    try {
      await browser.topSites.get().then((result = []) => {
        setTopSites(result.slice(0, 8));
      });
    } catch (err) {
      setTopSites(undefined);
    }
    setHasCheckedPermission(true);
  }, [browser]);

  const askTopSitesPermission = useCallback(async (): Promise<boolean> => {
    if (!browser) {
      return false;
    }

    const granted = await browser.permissions.request({
      permissions: ['topSites'],
    });
    if (granted) {
      await getTopSites();
    }
    return granted;
  }, [browser, getTopSites]);

  const revokePermission = useCallback(async (): Promise<void> => {
    if (!browser) {
      return;
    }

    await browser.permissions.remove({
      permissions: ['topSites'],
    });

    setTopSites(undefined);
  }, [browser]);

  useEffect(() => {
    if (!checkIsExtension()) {
      return;
    }

    if (!browser) {
      import('webextension-polyfill').then((mod) => setBrowser(mod.default));
    } else {
      getTopSites();
    }
  }, [browser, getTopSites]);

  return useMemo(
    () => ({
      topSites,
      hasCheckedPermission,
      askTopSitesPermission,
      revokePermission,
    }),
    [askTopSitesPermission, hasCheckedPermission, revokePermission, topSites],
  );
};
