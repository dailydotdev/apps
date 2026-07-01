import { NotificationAvatarType } from '../../graphql/notifications';
import type { NotificationAvatar } from '../../graphql/notifications';

// Which avatar leads a notification row. Always lead with the human who acted —
// the commenter, the upvoter, the follower, the person who posted — because
// that's the identity the notification is about. The backend often lists the
// source/squad first (e.g. squad comments arrive as [source, user]), which is
// why leading with `avatars[0]` showed a source logo instead of the actor. The
// source is still conveyed by the title text and the category badge. Falls back
// to the first avatar when there's no user at all (source-only notifications
// like "new post in <source>", role changes, or system/digest rows).
//
// Lives in its own module (not utils.ts) so the value import of
// NotificationAvatarType doesn't create a utils <-> graphql import cycle.
export const getNotificationLeadAvatar = (
  avatars: NotificationAvatar[] = [],
): NotificationAvatar | undefined =>
  avatars.find((avatar) => avatar.type === NotificationAvatarType.User) ??
  avatars[0];
