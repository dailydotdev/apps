import { isMutingDigestCompletely, NotificationType } from './utils';
import type { NotificationSettings } from './utils';

describe('isMutingDigestCompletely', () => {
  describe('with default BriefingReady type', () => {
    it('should return true when other channel is muted and current is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: 'muted',
          inApp: 'subscribed',
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(true);
    });

    it('should return false when other channel is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: 'subscribed',
          inApp: 'subscribed',
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });

    it('should return false when current channel is already muted', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: 'muted',
          inApp: 'muted',
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });

    it('should return true when checking email channel with inApp muted', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: 'subscribed',
          inApp: 'muted',
        },
      };

      expect(isMutingDigestCompletely(ns, 'email')).toBe(true);
    });
  });

  describe('with DigestReady type', () => {
    it('should return true when other channel is muted and current is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.DigestReady]: {
          email: 'muted',
          inApp: 'subscribed',
        },
      };

      expect(
        isMutingDigestCompletely(ns, 'inApp', NotificationType.DigestReady),
      ).toBe(true);
    });

    it('should return false when other channel is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.DigestReady]: {
          email: 'subscribed',
          inApp: 'subscribed',
        },
      };

      expect(
        isMutingDigestCompletely(ns, 'inApp', NotificationType.DigestReady),
      ).toBe(false);
    });

    it('should not be affected by BriefingReady settings', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: 'muted',
          inApp: 'subscribed',
        },
        [NotificationType.DigestReady]: {
          email: 'subscribed',
          inApp: 'subscribed',
        },
      };

      // DigestReady has both subscribed, so should be false
      expect(
        isMutingDigestCompletely(ns, 'inApp', NotificationType.DigestReady),
      ).toBe(false);

      // BriefingReady has email muted, so should be true with default
      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return false when notification type is not in settings', () => {
      const ns: NotificationSettings = {};

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });

    it('should return false when settings are partially defined', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: undefined as any,
          inApp: 'subscribed',
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });
  });
});
