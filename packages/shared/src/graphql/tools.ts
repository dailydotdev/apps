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

export interface ToolStacker {
  id: string;
  name: string;
  username: string;
  image: string;
}

const TOOL_STACKERS_QUERY = gql`
  query ToolStackers($id: ID!, $first: Int) {
    toolStackers(id: $id, first: $first) {
      id
      name
      username
      image
    }
  }
`;

export const getToolStackers = async (
  id: string,
  first = 5,
): Promise<ToolStacker[]> => {
  const result = await gqlClient.request<{ toolStackers: ToolStacker[] }>(
    TOOL_STACKERS_QUERY,
    { id, first },
  );
  return result.toolStackers;
};

export interface ToolTopPost {
  id: string;
  title: string | null;
  slug: string | null;
  image: string | null;
  numUpvotes: number;
  createdAt: string;
}

const TOOL_TOP_POSTS_QUERY = gql`
  query ToolTopPosts($tag: String!, $first: Int) {
    page: tagFeed(tag: $tag, first: $first, ranking: POPULARITY) {
      edges {
        node {
          id
          title
          slug
          image
          numUpvotes
          createdAt
        }
      }
    }
  }
`;

export const getToolTopPosts = async (
  tag: string,
  first = 5,
): Promise<ToolTopPost[]> => {
  const result = await gqlClient.request<{
    page?: { edges?: { node: ToolTopPost }[] };
  }>(TOOL_TOP_POSTS_QUERY, { tag, first });
  return (
    result.page?.edges?.map(({ node }) => node).filter((post) => post.title) ??
    []
  );
};
