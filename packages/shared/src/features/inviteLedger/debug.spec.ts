import {
  isInviteLedgerDebugEnabled,
  setInviteLedgerDebugEnabled,
  isStripDismissed,
  setStripDismissed,
} from './debug';

const ENABLED_KEY = 'inviteLedgerDebug';

describe('inviteLedger/debug', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  describe('isInviteLedgerDebugEnabled', () => {
    it('returns false when no flag is set', () => {
      expect(isInviteLedgerDebugEnabled()).toBe(false);
    });

    it('returns true when localStorage flag is true', () => {
      window.localStorage.setItem(ENABLED_KEY, 'true');
      expect(isInviteLedgerDebugEnabled()).toBe(true);
    });

    it('sets sticky flag when ?inviteLedgerDebug=1 is in URL', () => {
      window.history.replaceState({}, '', '/?inviteLedgerDebug=1');
      expect(isInviteLedgerDebugEnabled()).toBe(true);
      expect(window.localStorage.getItem(ENABLED_KEY)).toBe('true');
    });

    it('clears flag when ?inviteLedgerDebug=0 is in URL', () => {
      window.localStorage.setItem(ENABLED_KEY, 'true');
      window.history.replaceState({}, '', '/?inviteLedgerDebug=0');
      expect(isInviteLedgerDebugEnabled()).toBe(false);
      expect(window.localStorage.getItem(ENABLED_KEY)).toBeNull();
    });
  });

  describe('setInviteLedgerDebugEnabled', () => {
    it('dispatches change event', () => {
      const listener = jest.fn();
      window.addEventListener('invite-ledger:debug-change', listener);
      setInviteLedgerDebugEnabled(true);
      expect(listener).toHaveBeenCalled();
      expect(window.localStorage.getItem(ENABLED_KEY)).toBe('true');
      window.removeEventListener('invite-ledger:debug-change', listener);
    });
  });

  describe('strip dismissal', () => {
    it('is per-cohort so a new join shows again', () => {
      expect(isStripDismissed('user1')).toBe(false);
      setStripDismissed('user1');
      expect(isStripDismissed('user1')).toBe(true);
      expect(isStripDismissed('user1,user2')).toBe(false);
    });

    it('no-ops on empty cohort key', () => {
      setStripDismissed('');
      expect(isStripDismissed('')).toBe(false);
    });
  });
});
