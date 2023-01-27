import { gql } from 'graphql-request';

export enum SourceType {
  Machine = 'machine',
  Squad = 'squad',
}

export interface Source {
  __typename?: string;
  id?: string;
  name: string;
  image: string;
  handle: string;
  type: SourceType;
  permalink: string;
}

const SOURCE_PATH: Record<SourceType, string> = {
  machine: 'source',
  squad: 'squads',
};

export const getSourcePermalink = (id: string, type: SourceType): string => {
  const path = SOURCE_PATH[type];

  return `${process.env.NEXT_PUBLIC_WEBAPP_URL}${path}/${id}`;
};

export type SourceData = { source: Source };

export const SOURCE_BASE_FRAGMENT = gql`
  fragment SourceBaseFragment on Source {
    id
    active
    handle
    name
    permalink
    public
    type
    description
    image
    membersCount
    currentMember {
      role
      referralToken
    }
  }
`;

export const SOURCE_SHORT_INFO_FRAGMENT = gql`
  fragment SourceShortInfoFragment on Source {
    id
    handle
    name
    permalink
    description
    image
    type
  }
`;

export const SOURCE_QUERY = gql`
  query Source($id: ID!) {
    source(id: $id) {
      id
      image
      name
    }
  }
`;
