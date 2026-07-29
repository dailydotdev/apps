import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import NotificationItem from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import type { NotificationItemProps } from '@dailydotdev/shared/src/components/notifications/NotificationItem';
import {
  getNotificationCategory,
  NotificationFilterCategory,
  notificationCategoryBadge,
  notificationFilterCategoryLabel,
  NotificationIconType,
  NotificationType,
} from '@dailydotdev/shared/src/components/notifications/utils';
import { getNotificationLeadAvatar } from '@dailydotdev/shared/src/components/notifications/leadAvatar';
import { NotificationAvatarType } from '@dailydotdev/shared/src/graphql/notifications';
import ExtensionProviders from '../../extension/_providers';
import { postAttachment, sourceAvatar, userAvatar } from './_mock';

// One page that documents every notification scenario and EXPLAINS the avatar +
// badge logic, so the choices can be reviewed deliberately. Each card shows the
// rendered row, the avatars the API sends (in their real order), which one the
// row leads with, and why. The lead is computed with the SAME helper the
// component uses (getNotificationLeadAvatar), so this page never drifts from
// the real behavior.

const meta: Meta = {
  title: 'Components/Notifications/Use cases',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every notification scenario with its avatar/badge rationale. Lead avatar rule: always show the human who acted (commenter, upvoter, follower, poster); fall back to the source only when there is no person; system/digest rows show the type icon.',
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

interface UseCase {
  scenario: string;
  why: string;
  def: Partial<NotificationItemProps>;
}

interface Section {
  title: string;
  blurb: string;
  cases: UseCase[];
}

// Avatars are listed in the order the backend actually sends them — notably
// source-FIRST for squad activity, which is exactly what used to make the row
// show a source logo instead of the person who acted.
const sections: Section[] = [
  {
    title: 'Comments & replies',
    blurb:
      'A person commented or replied. Lead with that person — even when the API lists the squad/source first.',
    cases: [
      {
        scenario: 'Someone comments on your post',
        why: 'API sends [user]. Leads with the commenter. Blue Comments badge.',
        def: {
          type: NotificationType.ArticleNewComment,
          icon: NotificationIconType.Comment,
          title: '<b>Nimrod Kramer</b> commented on your post',
          description: 'Great write-up — the caching part really helped.',
          avatars: [userAvatar('nimrod', 'Nimrod Kramer')],
          attachments: [postAttachment('c1', 'Scaling our cache layer')],
        },
      },
      {
        scenario: 'Someone comments on your post inside a Squad',
        why: 'API sends [source, user]. FIXED: was showing the squad logo; now leads with the commenter (Lee). The squad is still clear from the title + badge.',
        def: {
          type: NotificationType.SquadNewComment,
          icon: NotificationIconType.Comment,
          title: '<b>Lee Solway</b> commented on your post in <b>WebDev</b>',
          description: 'Have you tried the new view transitions API?',
          avatars: [
            sourceAvatar('webdev', 'WebDev'),
            userAvatar('lee', 'Lee Solway'),
          ],
        },
      },
      {
        scenario: 'Reply to your comment',
        why: 'API sends [user]. Leads with the replier.',
        def: {
          type: NotificationType.CommentReply,
          icon: NotificationIconType.Comment,
          title: '<b>Ido Shamun</b> replied to your comment',
          description: 'Looks great — shipping it!',
          avatars: [userAvatar('ido', 'Ido Shamun')],
        },
      },
      {
        scenario: 'Reply to your comment inside a Squad',
        why: 'API sends [source, user]. FIXED: leads with the replier (Ante), not the AI squad logo.',
        def: {
          type: NotificationType.SquadReply,
          icon: NotificationIconType.Comment,
          title: '<b>Ante Barić</b> replied to your comment in <b>AI</b>',
          avatars: [sourceAvatar('ai', 'AI'), userAvatar('ante', 'Ante Barić')],
        },
      },
    ],
  },
  {
    title: 'Mentions',
    blurb: 'Someone @mentioned you. Lead with the person who mentioned you.',
    cases: [
      {
        scenario: 'Mentioned you in a post',
        why: 'Leads with the author. Pink Mentions badge.',
        def: {
          type: NotificationType.PostMention,
          icon: NotificationIconType.Comment,
          title: '<b>Tsahi Matsliah</b> mentioned you in a post',
          avatars: [userAvatar('tsahi', 'Tsahi Matsliah')],
          attachments: [postAttachment('m1', 'How we cut build times in half')],
        },
      },
      {
        scenario: 'Mentioned you in a comment',
        why: 'Leads with the author of the comment.',
        def: {
          type: NotificationType.CommentMention,
          icon: NotificationIconType.Comment,
          title: '<b>Tsahi Matsliah</b> mentioned you in a comment',
          description: 'Hey @you, what do you think about this approach?',
          avatars: [userAvatar('tsahi', 'Tsahi Matsliah')],
        },
      },
    ],
  },
  {
    title: 'Upvotes',
    blurb:
      'Reactions on your content. Lead with an upvoter; 4+ upvoters render as a face grid.',
    cases: [
      {
        scenario: 'A few upvotes on your post',
        why: 'API sends the upvoters. 3 or fewer → single lead (the first upvoter). Green Upvotes badge.',
        def: {
          type: NotificationType.ArticleUpvoteMilestone,
          icon: NotificationIconType.Upvote,
          title: '3 upvotes on your post! 🎉',
          numTotalAvatars: 3,
          avatars: [
            userAvatar('u1', 'Ada'),
            userAvatar('u2', 'Bram'),
            userAvatar('u3', 'Cleo'),
          ],
        },
      },
      {
        scenario: 'Many upvotes on your comment',
        why: 'FIXED case you flagged: leads with real upvoters (not you / not a source). 4+ → 2x2 face grid + the upvote badge.',
        def: {
          type: NotificationType.CommentUpvoteMilestone,
          icon: NotificationIconType.Upvote,
          title: '24 upvotes on your comment!',
          numTotalAvatars: 24,
          avatars: [
            userAvatar('u4', 'Dana'),
            userAvatar('u5', 'Eli'),
            userAvatar('u6', 'Fae'),
            userAvatar('u7', 'Gus'),
          ],
        },
      },
    ],
  },
  {
    title: 'Followers',
    blurb: 'Someone followed you. Lead with the follower (purple badge).',
    cases: [
      {
        scenario: 'New follower',
        why: 'Leads with the follower; includes the follow-back button.',
        def: {
          type: NotificationType.UserFollow,
          icon: NotificationIconType.User,
          title: '<b>Tobias Wolf</b> started following you',
          avatars: [userAvatar('tobias', 'Tobias Wolf')],
        },
      },
    ],
  },
  {
    title: 'Squads',
    blurb:
      'Squad activity. When a person acted, lead with the person; when it is about your role/squad status, lead with the squad.',
    cases: [
      {
        scenario: 'Someone posted in your Squad',
        why: 'API sends [source, user]. Leads with the poster (GeekLuffy). The squad is shown by the title + purple Squads badge.',
        def: {
          type: NotificationType.SquadPostAdded,
          icon: NotificationIconType.Bell,
          title: '<b>GeekLuffy</b> posted in <b>AI</b>',
          avatars: [sourceAvatar('ai', 'AI'), userAvatar('luffy', 'GeekLuffy')],
          attachments: [postAttachment('sq1', 'Fine-tuning on a budget')],
        },
      },
      {
        scenario: 'Someone joined your Squad',
        why: 'API sends [source, user]. Leads with the new member (Donald).',
        def: {
          type: NotificationType.SquadMemberJoined,
          icon: NotificationIconType.User,
          title: '<b>Donald Major</b> joined <b>DevOps</b>',
          avatars: [
            sourceAvatar('devops', 'DevOps'),
            userAvatar('donald', 'Donald Major'),
          ],
        },
      },
      {
        scenario: 'A post was submitted for review',
        why: 'API sends [source, user]. Leads with the submitter (Ankur).',
        def: {
          type: NotificationType.SourcePostSubmitted,
          icon: NotificationIconType.Bell,
          title: '<b>Ankur Gupta</b> submitted a post in <b>WebDev</b>',
          avatars: [
            sourceAvatar('webdev', 'WebDev'),
            userAvatar('ankur', 'Ankur Gupta'),
          ],
        },
      },
      {
        scenario: 'Your role in a Squad changed',
        why: 'API sends [source] only — no person acts here, so it correctly leads with the squad.',
        def: {
          type: NotificationType.PromotedToModerator,
          icon: NotificationIconType.Star,
          title: 'You are now a moderator in <b>AI</b>',
          avatars: [sourceAvatar('ai', 'AI')],
        },
      },
    ],
  },
  {
    title: 'Updates & following',
    blurb:
      'Content from sources/people you follow. Lead with the source when no person is involved, otherwise the person. No badge (these land in Updates).',
    cases: [
      {
        scenario: 'New post from a source you follow',
        why: 'API sends [source]. No person acts → leads with the source. No badge.',
        def: {
          type: NotificationType.SourcePostAdded,
          icon: NotificationIconType.Bell,
          title: 'New post in <b>Agentic Digest</b>',
          avatars: [sourceAvatar('agentic', 'Agentic Digest')],
          attachments: [
            postAttachment('p1', 'MAI-Code-1-Flash beats Haiku on SWE-Bench'),
          ],
        },
      },
      {
        scenario: 'Someone you follow published a post',
        why: 'API sends [user]. Leads with the author.',
        def: {
          type: NotificationType.UserPostAdded,
          icon: NotificationIconType.Bell,
          title: '<b>Ido Shamun</b> published a new post',
          avatars: [userAvatar('ido', 'Ido Shamun')],
          attachments: [postAttachment('p3', 'Lessons from scaling daily.dev')],
        },
      },
      {
        scenario: 'You received an award',
        why: 'API sends [user] — the giver. Leads with the giver; lands in Updates so no badge.',
        def: {
          type: NotificationType.UserReceivedAward,
          icon: NotificationIconType.Star,
          title: '<b>keshavashiya</b> awarded you +7 Cores!',
          avatars: [userAvatar('keshav', 'keshavashiya')],
        },
      },
    ],
  },
  {
    title: 'System, streaks & digests (no avatar)',
    blurb:
      'No human actor — these lead with the type icon, never an avatar or badge.',
    cases: [
      {
        scenario: 'Top reader badge earned',
        why: 'No avatars → the achievement icon leads.',
        def: {
          type: NotificationType.UserTopReaderBadge,
          icon: NotificationIconType.TopReaderBadge,
          title: 'You earned the Top Reader badge in <b>JavaScript</b>',
        },
      },
      {
        scenario: 'Streak about to expire',
        why: 'No avatars → the streak icon leads.',
        def: {
          type: NotificationType.StreakReminder,
          icon: NotificationIconType.Streak,
          title: 'Your 7-day streak is about to expire',
          description: 'Read a post today to keep it alive',
        },
      },
      {
        scenario: 'Daily digest / system update',
        why: 'No avatars → the daily.dev icon leads.',
        def: {
          type: NotificationType.System,
          icon: NotificationIconType.DailyDev,
          title: 'We updated our terms of service',
        },
      },
    ],
  },
];

const avatarTypeLabel: Partial<Record<NotificationAvatarType, string>> = {
  [NotificationAvatarType.User]: 'user',
  [NotificationAvatarType.Source]: 'source',
  [NotificationAvatarType.Organization]: 'org',
};

const Chip = ({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'lead';
}) => (
  <span
    className={
      tone === 'lead'
        ? 'rounded-6 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-black typo-caption2'
        : 'rounded-6 bg-surface-float px-1.5 py-0.5 text-text-secondary typo-caption2'
    }
  >
    {children}
  </span>
);

const Case = ({ scenario, why, def }: UseCase): React.ReactElement => {
  const props: NotificationItemProps = {
    onClick: fn(),
    targetUrl: '/post/123',
    referenceId: `case-${scenario}`,
    icon: NotificationIconType.Bell,
    type: NotificationType.System,
    title: 'Notification',
    isUnread: true,
    ...def,
  };
  const avatars = props.avatars ?? [];
  const lead = getNotificationLeadAvatar(avatars);
  const category = getNotificationCategory(props.type);
  const showsBadge =
    avatars.length > 0 && category !== NotificationFilterCategory.Updates;
  const badge = notificationCategoryBadge[category];

  return (
    <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <h3 className="font-bold text-text-primary typo-callout">{scenario}</h3>
      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
        <NotificationItem {...props} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-text-tertiary typo-caption1">API avatars:</span>
          {avatars.length === 0 && <Chip>none → type icon</Chip>}
          {avatars.map((a, i) => (
            <Chip key={`${a.referenceId}-${i}`}>
              {avatarTypeLabel[a.type] ?? a.type} · {a.name}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-text-tertiary typo-caption1">Leads with:</span>
          <Chip tone="lead">
            {lead
              ? `${avatarTypeLabel[lead.type] ?? lead.type} · ${lead.name}`
              : 'type icon'}
          </Chip>
          <span className="text-text-tertiary typo-caption1">Badge:</span>
          {showsBadge ? (
            <span className="inline-flex items-center gap-1">
              <span className={`size-3 rounded-full ${badge.bg}`} />
              <Chip>{notificationFilterCategoryLabel[category]}</Chip>
            </span>
          ) : (
            <Chip>none</Chip>
          )}
        </div>
        <p className="text-text-tertiary typo-footnote">{why}</p>
      </div>
    </div>
  );
};

const AllUseCases = (): React.ReactElement => (
  <div className="mx-auto max-w-[44rem] p-6">
    <h1 className="font-bold text-text-primary typo-title2">
      Notification use cases
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      Every scenario and the reasoning behind the avatar + badge it shows.
    </p>
    <div className="mt-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
      <b className="text-text-primary">Lead avatar rule.</b> Always show the
      human who acted — the commenter, upvoter, follower, or poster. The backend
      often lists the squad/source first (squad activity arrives as{' '}
      <code>[source, user]</code>), which is why rows used to show a source logo
      instead of the person. We now pick the user; the source stays clear from
      the title text and the colored category badge. When there is no person (a
      source posting, a role change, a system/digest message) the row leads with
      the source, or the type icon when there is no avatar at all.
    </div>

    <div className="mt-6 flex flex-col gap-8">
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <div>
            <h2 className="font-bold text-text-primary typo-title3">
              {section.title}
            </h2>
            <p className="text-text-tertiary typo-footnote">{section.blurb}</p>
          </div>
          {section.cases.map((useCase) => (
            <Case key={useCase.scenario} {...useCase} />
          ))}
        </section>
      ))}
    </div>
  </div>
);

export const AllCases: Story = {
  name: 'All use cases',
  render: () => <AllUseCases />,
};
