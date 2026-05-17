import {
  isInviteLedgerDebugEnabled,
  setInviteLedgerDebugEnabled,
  isStripDismissed,
  setStripDismissed,
  getInviteLedgerDemoMode,
  setInviteLedgerDemoMode,
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

  describe('demo mode', () => {
    it('defaults to null', () => {
      expect(getInviteLedgerDemoMode()).toBeNull();
    });

    it('persists ?inviteLedgerDemoData=full', () => {
      window.history.replaceState({}, '', '/?inviteLedgerDemoData=full');
      expect(getInviteLedgerDemoMode()).toBe('full');
      expect(window.localStorage.getItem('inviteLedgerDemoMode')).toBe('full');
    });

    it('persists ?inviteLedgerDemoData=empty and =single', () => {
      window.history.replaceState({}, '', '/?inviteLedgerDemoData=empty');
      expect(getInviteLedgerDemoMode()).toBe('empty');
      window.history.replaceState({}, '', '/?inviteLedgerDemoData=single');
      expect(getInviteLedgerDemoMode()).toBe('single');
    });

    it('clears with ?inviteLedgerDemoData=off', () => {
      window.localStorage.setItem('inviteLedgerDemoMode', 'full');
      window.history.replaceState({}, '', '/?inviteLedgerDemoData=off');
      expect(getInviteLedgerDemoMode()).toBeNull();
      expect(window.localStorage.getItem('inviteLedgerDemoMode')).toBeNull();
    });

    it('ignores invalid mode values', () => {
      window.history.replaceState({}, '', '/?inviteLedgerDemoData=garbage');
      expect(getInviteLedgerDemoMode()).toBeNull();
    });

    it('setter dispatches change event', () => {
      const listener = jest.fn();
      window.addEventListener('invite-ledger:demo-mode-change', listener);
      setInviteLedgerDemoMode('full');
      expect(listener).toHaveBeenCalled();
      expect(window.localStorage.getItem('inviteLedgerDemoMode')).toBe('full');
      setInviteLedgerDemoMode(null);
      expect(window.localStorage.getItem('inviteLedgerDemoMode')).toBeNull();
      window.removeEventListener('invite-ledger:demo-mode-change', listener);
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
