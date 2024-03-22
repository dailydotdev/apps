import request, { gql } from 'graphql-request';
import { graphqlUrl } from '../lib/config';

export enum ActionType {
  CreateSquad = 'create_squad',
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
  const res = await request(graphqlUrl, COMPLETED_USER_ACTIONS);

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
  request(graphqlUrl, COMPLETE_ACTION_MUTATION, { type });
