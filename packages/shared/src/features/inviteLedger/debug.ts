/**
 * Demo override for the invite ledger. `?inviteLedgerDebug=1` (or the sticky
 * localStorage flag) force-enables the feature for the signed-in user so the
 * surface can be reviewed on a Vercel preview where `featureInviteLedger`
 * defaults to false.
 *
 * `?inviteLedgerDebug=0` turns it back off.
 */

const ENABLED_KEY = 'inviteLedgerDebug';
const STRIP_DISMISS_PREFIX = 'inviteLedgerStripDismissed:';

const safeWindow = (): Window | null =>
  typeof window === 'undefined' ? null : window;

export const isInviteLedgerDebugEnabled = (): boolean => {
  const win = safeWindow();
  if (!win) {
    return false;
  }
  if (win.location.search.includes('inviteLedgerDebug=0')) {
    win.localStorage.removeItem(ENABLED_KEY);
    return false;
  }
  if (win.location.search.includes('inviteLedgerDebug=1')) {
    win.localStorage.setItem(ENABLED_KEY, 'true');
    return true;
  }
  return win.localStorage.getItem(ENABLED_KEY) === 'true';
};

export const setInviteLedgerDebugEnabled = (enabled: boolean): void => {
  const win = safeWindow();
  if (!win) {
    return;
  }
  if (enabled) {
    win.localStorage.setItem(ENABLED_KEY, 'true');
  } else {
    win.localStorage.removeItem(ENABLED_KEY);
  }
  win.dispatchEvent(new Event('invite-ledger:debug-change'));
};

export const getStripDismissalKey = (cohortKey: string): string =>
  `${STRIP_DISMISS_PREFIX}${cohortKey}`;

export const isStripDismissed = (cohortKey: string): boolean => {
  const win = safeWindow();
  if (!win || !cohortKey) {
    return false;
  }
  return win.localStorage.getItem(getStripDismissalKey(cohortKey)) === 'true';
};

export const setStripDismissed = (cohortKey: string): void => {
  const win = safeWindow();
  if (!win || !cohortKey) {
    return;
  }
  win.localStorage.setItem(getStripDismissalKey(cohortKey), 'true');
};
