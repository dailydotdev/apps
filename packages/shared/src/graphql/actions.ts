import { gql } from 'graphql-request';
import { gqlClient } from './common';

export enum ActionType {
  CreateSquad = 'create_squad',
  EditSquad = 'edit_squad',
  JoinSquad = 'join_squad',
  EditWelcomePost = 'edit_welcome_post',
  SquadFirstComment = 'squad_first_comment',
  SquadFirstPost = 'squad_first_post',
  MyFeed = 'my_feed',
  SquadInvite = 'squad_invite',
  BrowserExtension = 'browser_extension',
  EnableNotification = 'enable_notification',
  WritePost = 'write_post',
  HideBlockPanel = 'hide_block_panel',
  ExistingAnonymousBanner = 'existingAnonymousBanner',
  AcceptedSearch = 'accepted_search',
  UsedSearch = 'used_search',
  CollectionsIntro = 'collections_intro',
  DevCardGenerate = 'dev_card_generate',
  AckRep250 = 'ack_rep_250',
  CommentFeed = 'comment_feed',
  ExistingUserSeenStreaks = 'existing_user_seen_streaks',
  BookmarkPromoteMobile = 'bookmark_promote_mobile',
  HidePublicSquadEligibilityCard = 'hide_public_squad_eligibility_card',
  HidePublicSquadStep = 'hide_public_squad_step',
  MakeSquadPublic = 'make_squad_public',
  CustomFeed = 'custom_feed',
  DisableReadingStreakMilestone = 'disable_reading_streak_milestone',
  FirstShortcutsSession = 'first_shortcuts_session',
  VotePost = 'vote_post',
  BookmarkPost = 'bookmark_post',
  DigestConfig = 'digest_config',
  StreakMilestone = 'streak_milestone',
  ShowSummary = 'show_summary',
}

export interface Action {
  type: ActionType;
  completedAt: Date;
}

export const COMPLETED_USER_ACTIONS = gql`
  {
    actions {
      type
      completedAt
    }
  }
`;

export const getUserActions = async (): Promise<Action[]> => {
  const res = await gqlClient.request(COMPLETED_USER_ACTIONS);

  return res.actions;
};

export const COMPLETE_ACTION_MUTATION = gql`
  mutation CompleteAction($type: String!) {
    completeAction(type: $type) {
      _
    }
  }
`;

export const completeUserAction = async (type: ActionType): Promise<void> =>
  gqlClient.request(COMPLETE_ACTION_MUTATION, { type });
