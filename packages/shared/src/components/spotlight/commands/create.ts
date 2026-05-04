import type { NextRouter } from 'next/router';
import {
  BookmarkIcon,
  EditIcon,
  FeedbackIcon,
  GiftIcon,
  MegaphoneIcon,
  PlusIcon,
  PollIcon,
  ShortcutsIcon,
  SlackIcon,
  SourceIcon,
  SquadIcon,
} from '../../icons';
import { LazyModal } from '../../modals/common/types';
import type { LazyModalType, ModalsType } from '../../modals/common';
import { webappUrl } from '../../../lib/constants';
import { SpotlightGroup, type SpotlightCommand } from '../types';

interface CreateContext {
  router: Pick<NextRouter, 'push'>;
  openModal: <K extends keyof ModalsType>(data: LazyModalType<K>) => void;
}

export const getCreateCommands = ({
  router,
  openModal,
}: CreateContext): SpotlightCommand[] => [
  {
    id: 'create.compose-text',
    title: 'Open composer',
    subtitle: 'Write a post, share a link, or start a discussion',
    icon: EditIcon,
    keywords: ['write', 'post', 'share', 'link', 'compose'],
    group: SpotlightGroup.Create,
    shortcut: 'c',
    requiresAuth: true,
    perform: () => {
      openModal({
        type: LazyModal.SmartComposer,
        props: { initialKind: 'text' },
      });
    },
  },
  {
    id: 'create.compose-poll',
    title: 'Create poll',
    subtitle: 'Ask the community a question',
    icon: PollIcon,
    keywords: ['poll', 'vote', 'question'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({
        type: LazyModal.SmartComposer,
        props: { initialKind: 'poll' },
      });
    },
  },
  {
    id: 'create.compose-standup',
    title: 'Start standup',
    subtitle: 'Open a live audio room',
    icon: MegaphoneIcon,
    keywords: ['standup', 'live', 'audio', 'room'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({
        type: LazyModal.SmartComposer,
        props: { initialKind: 'standup' },
      });
    },
  },
  {
    id: 'create.new-squad',
    title: 'Create new squad',
    subtitle: 'Start a community',
    icon: SquadIcon,
    keywords: ['squad', 'community', 'group'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({ type: LazyModal.NewSquad });
    },
  },
  {
    id: 'create.new-feed',
    title: 'Create new custom feed',
    icon: PlusIcon,
    keywords: ['feed', 'custom feed'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      router.push(`${webappUrl}feeds/new`);
    },
  },
  {
    id: 'create.bookmark-folder',
    title: 'Create new bookmark folder',
    icon: BookmarkIcon,
    keywords: ['folder', 'organize bookmarks'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      router.push(`${webappUrl}bookmarks?createFolder=1`);
    },
  },
  {
    id: 'create.suggest-source',
    title: 'Suggest a source',
    subtitle: 'Add a publication to daily.dev',
    icon: SourceIcon,
    keywords: ['publisher', 'rss', 'request source'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({ type: LazyModal.NewSource });
    },
  },
  {
    id: 'create.feedback',
    title: 'Submit feedback',
    icon: FeedbackIcon,
    keywords: ['report', 'bug', 'idea', 'suggestion'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({ type: LazyModal.Feedback });
    },
  },
  {
    id: 'create.gift-plus',
    title: 'Gift Plus',
    subtitle: 'Send a Plus subscription',
    icon: GiftIcon,
    keywords: ['gift', 'plus', 'subscription'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({ type: LazyModal.GiftPlus });
    },
  },
  {
    id: 'create.connect-slack',
    title: 'Manage Slack integration',
    icon: SlackIcon,
    keywords: ['integration', 'slack'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      router.push(`${webappUrl}settings/integrations`);
    },
  },
  {
    id: 'create.manage-shortcuts',
    title: 'Manage shortcuts',
    icon: ShortcutsIcon,
    keywords: ['shortcuts', 'links', 'pinned'],
    group: SpotlightGroup.Create,
    requiresAuth: true,
    perform: () => {
      openModal({ type: LazyModal.ShortcutsManage });
    },
  },
];
