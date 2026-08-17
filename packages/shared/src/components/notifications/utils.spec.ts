import {
  ACHIEVEMENT_KEYS,
  COMMENT_KEYS,
  FOLLOWING_KEYS,
  isMutingDigestCompletely,
  MENTION_KEYS,
  NotificationType,
  OPPORTUNITY_KEYS,
  POLL_RESULT_KEYS,
  SQUAD_KEYS,
  STREAK_KEYS,
  WORLD_KEYS,
} from './utils';
import type { NotificationSettings } from './utils';
import { NotificationPreferenceStatus } from '../../graphql/notifications';

const muted = NotificationPreferenceStatus.Muted;
const subscribed = NotificationPreferenceStatus.Subscribed;

describe('isMutingDigestCompletely', () => {
  describe('with default BriefingReady type', () => {
    it('should return true when other channel is muted and current is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: muted,
          inApp: subscribed,
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(true);
    });

    it('should return false when other channel is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: subscribed,
          inApp: subscribed,
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });

    it('should return false when current channel is already muted', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: muted,
          inApp: muted,
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });

    it('should return true when checking email channel with inApp muted', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: subscribed,
          inApp: muted,
        },
      };

      expect(isMutingDigestCompletely(ns, 'email')).toBe(true);
    });
  });

  describe('with DigestReady type', () => {
    it('should return true when other channel is muted and current is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.DigestReady]: {
          email: muted,
          inApp: subscribed,
        },
      };

      expect(
        isMutingDigestCompletely(ns, 'inApp', NotificationType.DigestReady),
      ).toBe(true);
    });

    it('should return false when other channel is subscribed', () => {
      const ns: NotificationSettings = {
        [NotificationType.DigestReady]: {
          email: subscribed,
          inApp: subscribed,
        },
      };

      expect(
        isMutingDigestCompletely(ns, 'inApp', NotificationType.DigestReady),
      ).toBe(false);
    });

    it('should not be affected by BriefingReady settings', () => {
      const ns: NotificationSettings = {
        [NotificationType.BriefingReady]: {
          email: muted,
          inApp: subscribed,
        },
        [NotificationType.DigestReady]: {
          email: subscribed,
          inApp: subscribed,
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
          inApp: subscribed,
        },
      };

      expect(isMutingDigestCompletely(ns, 'inApp')).toBe(false);
    });
  });
});

describe('world notification settings keys', () => {
  it('should give the world its own group', () => {
    // Bundled into the achievements toggle, the only way to stop hearing about
    // a world was to stop hearing about badges too, under a label that never
    // mentions worlds.
    expect(WORLD_KEYS).toEqual([NotificationType.WorldDistrictLevelUp]);
    expect(ACHIEVEMENT_KEYS).not.toContain(
      NotificationType.WorldDistrictLevelUp,
    );
  });

  it('should not share a key with any other settings group', () => {
    const others = [
      ACHIEVEMENT_KEYS,
      MENTION_KEYS,
      STREAK_KEYS,
      COMMENT_KEYS,
      SQUAD_KEYS,
      FOLLOWING_KEYS,
      POLL_RESULT_KEYS,
      OPPORTUNITY_KEYS,
    ].flat();

    // A key in two groups makes one toggle silently move the other.
    expect(others).not.toContain(NotificationType.WorldDistrictLevelUp);
  });
});
