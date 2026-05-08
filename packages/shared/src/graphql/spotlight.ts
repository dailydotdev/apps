import { gql } from 'graphql-request';

export enum SpotlightActionGroup {
  Navigate = 'Navigate',
  Create = 'Create',
  Settings = 'Settings',
  Actions = 'Actions',
  Help = 'Help',
  Search = 'Search',
}

export enum SpotlightActionKind {
  OpenModal = 'OpenModal',
  OpenUrl = 'OpenUrl',
  Navigate = 'Navigate',
  ToggleSetting = 'ToggleSetting',
  RunClientAction = 'RunClientAction',
}

export type SpotlightPlatform = 'webapp' | 'extension';

export type SpotlightAction = {
  id: string;
  group: SpotlightActionGroup;
  title: string;
  subtitle?: string | null;
  icon: string;
  keywords: string[];
  shortcut?: string | null;
  quickKey?: string | null;
  requiresAuth?: boolean | null;
  requiresPlus?: boolean | null;
  platforms?: SpotlightPlatform[] | null;
  kind: SpotlightActionKind;
  payload: Record<string, unknown>;
};

export const SPOTLIGHT_ACTIONS_QUERY = gql`
  query SpotlightActions {
    spotlightActions {
      id
      group
      title
      subtitle
      icon
      keywords
      shortcut
      quickKey
      requiresAuth
      requiresPlus
      platforms
      kind
      payload
    }
  }
`;
