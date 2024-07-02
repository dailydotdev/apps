import { TopSites } from 'webextension-polyfill';

let providedPermission = false;

const browser: any = {
  permissions: {
    remove: () => null,
    request: () =>
      new Promise((resolve) => {
        providedPermission = true;
        resolve(true);
      }),
  },
  topSites: {
    get: () =>
      new Promise((resolve, reject): TopSites.MostVisitedURL[] | void => {
        if (!providedPermission) {
          return reject();
        }

        providedPermission = false;
        return resolve([
          { url: 'http://abc1.com' },
          { url: 'http://abc2.com' },
          { url: 'http://abc3.com' },
        ]);
      }),
  },
};
export default browser;

interface Tab {
  id: number;
}

export interface Tabs {
  Tab: Tab;
}
