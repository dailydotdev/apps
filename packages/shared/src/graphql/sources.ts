import { gql } from 'graphql-request';

export interface Source {
  __typename?: string;
  id?: string;
  name: string;
  image: string;
}

export const getSourcePermalink = (id: string): string =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${id}`;

export type SourceData = { source: Source };

export const SOURCE_QUERY = gql`
  query Source($id: ID!) {
    source(id: $id) {
      id
      image
      name
    }
  }
`;
