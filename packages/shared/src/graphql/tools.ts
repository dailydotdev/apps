import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { DatasetTool } from './user/userStack';

export interface ToolPageTool extends DatasetTool {
  slug: string;
  url: string | null;
  stackCount: number;
  keyword: string | null;
}

export interface AlsoStackedTool extends DatasetTool {
  slug: string;
}

const DATASET_TOOL_QUERY = gql`
  query DatasetTool($slug: String!) {
    datasetTool(slug: $slug) {
      id
      title
      slug
      url
      faviconUrl
      stackCount
      keyword
    }
  }
`;

const TOOLS_ALSO_STACKED_QUERY = gql`
  query ToolsAlsoStacked($id: ID!, $first: Int) {
    toolsAlsoStacked(id: $id, first: $first) {
      id
      title
      slug
      faviconUrl
    }
  }
`;

export const getDatasetTool = async (slug: string): Promise<ToolPageTool> => {
  const result = await gqlClient.request<{ datasetTool: ToolPageTool }>(
    DATASET_TOOL_QUERY,
    { slug },
  );
  return result.datasetTool;
};

export const getToolsAlsoStacked = async (
  id: string,
  first = 6,
): Promise<AlsoStackedTool[]> => {
  const result = await gqlClient.request<{
    toolsAlsoStacked: AlsoStackedTool[];
  }>(TOOLS_ALSO_STACKED_QUERY, { id, first });
  return result.toolsAlsoStacked;
};
