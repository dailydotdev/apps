import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { DatasetTool } from './user/userStack';

export interface ToolPageTool extends DatasetTool {
  slug: string;
  url: string | null;
  category: string | null;
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
      category
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

export interface ToolAdoptionPoint {
  date: string;
  count: number;
}

export interface ToolAdoption {
  stackCount: number;
  percentile: number | null;
  quarterGrowth: number | null;
  monthly: ToolAdoptionPoint[];
}

const TOOL_ADOPTION_QUERY = gql`
  query ToolAdoption($id: ID!) {
    toolAdoption(id: $id) {
      stackCount
      percentile
      quarterGrowth
      monthly {
        date
        count
      }
    }
  }
`;

export const getToolAdoption = async (id: string): Promise<ToolAdoption> => {
  const result = await gqlClient.request<{ toolAdoption: ToolAdoption }>(
    TOOL_ADOPTION_QUERY,
    { id },
  );
  return result.toolAdoption;
};

export interface ToolTake {
  id: string;
  emoji: string;
  title: string;
  subtitle: string | null;
  upvotes: number;
  user: {
    id: string;
    name: string;
    username: string;
    image: string;
  } | null;
}

const TOOL_TAKES_QUERY = gql`
  query ToolTakes($id: ID!, $first: Int) {
    toolTakes(id: $id, first: $first) {
      id
      emoji
      title
      subtitle
      upvotes
      user {
        id
        name
        username
        image
      }
    }
  }
`;

export const getToolTakes = async (
  id: string,
  first = 3,
): Promise<ToolTake[]> => {
  const result = await gqlClient.request<{ toolTakes: ToolTake[] }>(
    TOOL_TAKES_QUERY,
    { id, first },
  );
  return result.toolTakes;
};

const TOOL_STACKERS_FOLLOWING_QUERY = gql`
  query ToolStackersFollowing($id: ID!, $first: Int) {
    toolStackersFollowing(id: $id, first: $first) {
      id
      name
      username
      image
    }
  }
`;

export const getToolStackersFollowing = async (
  id: string,
  first = 5,
): Promise<ToolStacker[]> => {
  const result = await gqlClient.request<{
    toolStackersFollowing: ToolStacker[];
  }>(TOOL_STACKERS_FOLLOWING_QUERY, { id, first });
  return result.toolStackersFollowing;
};

export interface DirectoryTool {
  id: string;
  title: string;
  slug: string;
  faviconUrl: string | null;
  category: string | null;
  stackCount: number;
}

const TOP_TOOLS_QUERY = gql`
  query TopTools($first: Int, $category: String, $trending: Boolean) {
    topTools(first: $first, category: $category, trending: $trending) {
      id
      title
      slug
      faviconUrl
      category
      stackCount
    }
  }
`;

export const getTopTools = async ({
  first = 6,
  category,
  trending,
}: {
  first?: number;
  category?: string;
  trending?: boolean;
} = {}): Promise<DirectoryTool[]> => {
  const result = await gqlClient.request<{ topTools: DirectoryTool[] }>(
    TOP_TOOLS_QUERY,
    { first, category, trending },
  );
  return result.topTools;
};

export interface ToolCategoryStat {
  category: string;
  toolCount: number;
}

const TOOL_CATEGORIES_QUERY = gql`
  query ToolCategories {
    toolCategories {
      category
      toolCount
    }
  }
`;

export const getToolCategories = async (): Promise<ToolCategoryStat[]> => {
  const result = await gqlClient.request<{
    toolCategories: ToolCategoryStat[];
  }>(TOOL_CATEGORIES_QUERY);
  return result.toolCategories;
};

export const getToolCategoryAnchor = (category: string): string =>
  category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
