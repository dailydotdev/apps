import { gql } from 'graphql-request';

export interface Decoration {
  id: string;
  name: string;
  media: string;
  decorationGroup: string;
  unlockCriteria: string | null;
  isUnlocked: boolean;
}

export interface DecorationGroup {
  group: string;
  label: string;
  decorations: Decoration[];
}

export const DECORATION_FRAGMENT = gql`
  fragment DecorationFragment on Decoration {
    id
    name
    media
    decorationGroup
    unlockCriteria
  }
`;

export const DECORATIONS_BY_GROUP_QUERY = gql`
  query DecorationsByGroup {
    decorationsByGroup {
      group
      label
      decorations {
        id
        name
        media
        decorationGroup
        unlockCriteria
        isUnlocked
      }
    }
  }
`;

export const SET_ACTIVE_DECORATION_MUTATION = gql`
  mutation SetActiveDecoration($decorationId: ID) {
    setActiveDecoration(decorationId: $decorationId) {
      id
      activeDecoration {
        id
        name
        media
      }
    }
  }
`;
