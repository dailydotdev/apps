import { gqlClient } from '../common';
import { SOURCE_CATEGORY_FRAGMENT } from '../fragments';

export const SOURCE_CATEGORY_QUERY = `
  query SourceCategory($id: String!) {
    sourceCategory(id: $id) {
      ...SourceCategoryFragment
    }
  }
  ${SOURCE_CATEGORY_FRAGMENT}
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
