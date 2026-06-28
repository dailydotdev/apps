import React, { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import classNames from 'classnames';
import NotificationsBell from '@dailydotdev/shared/src/components/notifications/NotificationsBell';
import { InAppNotificationItem } from '@dailydotdev/shared/src/components/notifications/InAppNotificationItem';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import {
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
// The real production entrance animation lives in this CSS module — importing
// it here renders the "Current" popup exactly as it animates in the app.
import inAppStyles from '@dailydotdev/shared/src/components/notifications/InAppNotification.module.css';
import ExtensionProviders from '../../extension/_providers';
import { userAvatar, sourceAvatar } from './_mock';

// Playground: watch a notification arrive — the NotificationsBell badge ticks
// up and the in-app popup flies in — so the entrance motion can be evaluated
// and improved. "Current" mirrors production exactly; "Proposed" is a calmer
// spring (no infinite bounce) plus a badge pop on the bell.

const meta: Meta = {
  title: 'Components/Notifications/Incoming playground',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Simulates a notification arriving in-product: the bell badge increments and the real-time popup animates in. Toggle Current vs Proposed entrance motion. The popup uses the redesigned item (icon + category badge lead, bold-name headline).',
      },
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

type Kind = 'comment' | 'upvote' | 'follow' | 'system';

const SAMPLES: Record<
  Kind,
  Pick<
    React.ComponentProps<typeof InAppNotificationItem>,
    'icon' | 'type' | 'title' | 'avatars'
  >
> = {
  comment: {
    icon: NotificationIconType.Comment,
    type: NotificationType.CommentReply,
    title: '<b>Ido Shamun</b> replied to your comment',
    avatars: [userAvatar('ido', 'Ido')],
  },
  upvote: {
    icon: NotificationIconType.Upvote,
    type: NotificationType.ArticleUpvoteMilestone,
    title: '<b>Nimrod Kramer</b> and 24 others upvoted your post',
    avatars: [userAvatar('nimrod', 'Nimrod')],
  },
  follow: {
    icon: NotificationIconType.User,
    type: NotificationType.UserFollow,
    title: '<b>Tobias Wolf</b> started following you',
    avatars: [userAvatar('tobias', 'Tobias')],
  },
  system: {
    icon: NotificationIconType.DailyDev,
    type: NotificationType.DigestReady,
    title: 'Your daily digest is ready',
    avatars: undefined,
  },
};

// Calmer alternative entrance + a badge pop, kept story-local so nothing ships
// until it's chosen. Compare against the production motion with the toggle.
const proposedCss = `
@keyframes nudgePopupIn {
  0% { transform: translateY(12px) scale(0.96); opacity: 0; }
  60% { transform: translateY(-2px) scale(1.01); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes nudgeBadgePop {
  0% { transform: scale(0.4); }
  60% { transform: scale(1.18); }
  100% { transform: scale(1); }
}
.nudge-popup-in { animation: nudgePopupIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) both; }
.nudge-badge-pop { animation: nudgeBadgePop 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
`;

const Playground = (): React.ReactElement => {
  const [unread, setUnread] = useState(2);
  const [kind, setKind] = useState<Kind>('comment');
  const [proposed, setProposed] = useState(false);
  // `seq` changes per send so the popup remounts and replays its entrance.
  const [popup, setPopup] = useState<{ seq: number; kind: Kind } | null>(null);
  const seqRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const send = useCallback(
    (next: Kind) => {
      seqRef.current += 1;
      setUnread((u) => Math.min(u + 1, 999));
      setPopup({ seq: seqRef.current, kind: next });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPopup(null), 5200);
    },
    [],
  );

  const sample = popup ? SAMPLES[popup.kind] : null;

  return (
    <div className="min-h-[36rem]">
      <style>{proposedCss}</style>

      {/* Mock product top bar with the real bell on the right. */}
      <header className="flex items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4 py-2">
        <span className="font-bold text-text-primary typo-title3">
          daily.dev
        </span>
        <NotificationsContextProvider unreadCount={unread} isNotificationsReady>
          {/* Keyed so the bell remounts on each new notification, replaying the
              proposed badge pop. */}
          <span
            key={proposed ? popup?.seq ?? 0 : 'static'}
            className={classNames(
              'inline-flex [&_span]:!origin-center',
              proposed && popup && '[&_.absolute]:nudge-badge-pop',
            )}
          >
            <NotificationsBell />
          </span>
        </NotificationsContextProvider>
      </header>

      {/* Controls */}
      <div className="mx-auto flex max-w-xl flex-col gap-4 p-8">
        <p className="text-text-tertiary typo-callout">
          Send a notification and watch it arrive (popup appears bottom-right on
          desktop, top-center on mobile). Unread: <b>{unread}</b>.
        </p>

        <div className="flex flex-row flex-wrap items-center gap-2">
          <span className="text-text-secondary typo-footnote">Type:</span>
          {(Object.keys(SAMPLES) as Kind[]).map((k) => (
            <Button
              key={k}
              size={ButtonSize.Small}
              variant={
                kind === k ? ButtonVariant.Primary : ButtonVariant.Secondary
              }
              onClick={() => setKind(k)}
            >
              {k}
            </Button>
          ))}
        </div>

        <div className="flex flex-row flex-wrap items-center gap-2">
          <span className="text-text-secondary typo-footnote">Motion:</span>
          <Button
            size={ButtonSize.Small}
            variant={!proposed ? ButtonVariant.Primary : ButtonVariant.Secondary}
            onClick={() => setProposed(false)}
          >
            Current (production)
          </Button>
          <Button
            size={ButtonSize.Small}
            variant={proposed ? ButtonVariant.Primary : ButtonVariant.Secondary}
            onClick={() => setProposed(true)}
          >
            Proposed (spring + badge pop)
          </Button>
        </div>

        <div>
          <Button variant={ButtonVariant.Primary} onClick={() => send(kind)}>
            Send {kind} notification
          </Button>
        </div>
      </div>

      {/* The popup. Fixed like production; remounted per send via `key`. */}
      {popup && sample && (
        <div
          key={popup.seq}
          className={classNames(
            'fixed right-1/2 z-3 h-22 w-[22.5rem] translate-x-1/2 rounded-16 border border-theme-active bg-accent-pepper-subtler top-16 laptop:right-10 laptop:bottom-10 laptop:top-[unset] laptop:translate-x-0',
            proposed
              ? 'nudge-popup-in'
              : classNames(
                  inAppStyles.inAppNotificationContainer,
                  'animate-bounce slide-in',
                ),
          )}
          role="alert"
        >
          <ModalClose
            size={ButtonSize.XSmall}
            top="3"
            right="3"
            onClick={() => setPopup(null)}
          />
          <InAppNotificationItem
            id={`play-${popup.seq}`}
            createdAt={new Date()}
            targetUrl="/notifications"
            onClick={fn()}
            {...sample}
          />
        </div>
      )}
    </div>
  );
};

export const Playground_: Story = {
  name: 'Watch it arrive',
  render: () => <Playground />,
};
