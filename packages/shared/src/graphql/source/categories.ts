import { gqlClient } from '../common';

export const SOURCE_CATEGORY_QUERY = `
  query SourceCategory($id: ID!) {
    sourceCategory(id: $id) {
      id
      title
    }
  }
`;

export interface SourceCategory {
  id: string;
  title: string;
  createdAt: Date;
}

export const getSourceCategory = async (
  id: string,
): Promise<SourceCategory> => {
  const res = await gqlClient.request(SOURCE_CATEGORY_QUERY, {
    id,
  });

  return res.sourceCategory;
};
