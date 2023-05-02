import request, { gql } from 'graphql-request';
import { graphqlUrl } from '../lib/config';

export enum ActionType {
  Notification = 'notification',
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
