import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import type { UserShortProfile } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { webappUrl } from '../lib/constants';

export const PLUGIN_NAME_MAX_LENGTH = 60;
export const PLUGIN_DESCRIPTION_MAX_LENGTH = 300;
export const PLUGIN_ABOUT_MAX_LENGTH = 20_000;
export const PLUGIN_SKILL_MD_MAX_LENGTH = 50_000;
export const PLUGIN_URL_MAX_LENGTH = 500;

export const PLUGIN_API_BASE_URL = 'https://api.daily.dev/public/v1/plugins';

export const marketplaceUrl = `${webappUrl}marketplace`;

export const marketplaceSubmitUrl = `${marketplaceUrl}/submit`;

export const getMarketplacePluginUrl = (id: string): string =>
  `${marketplaceUrl}/${id}`;

export enum PluginSubmissionStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Superseded = 'superseded',
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  about?: string;
  url: string | null;
  hasSkillMd: boolean;
  skillMd?: string | null;
  author: Pick<UserShortProfile, 'id' | 'name' | 'username' | 'image'>;
  createdAt: string;
  updatedAt: string;
}

export interface PluginSubmission {
  id: string;
  pluginId: string | null;
  plugin: Pick<Plugin, 'id' | 'name'> | null;
  status: PluginSubmissionStatus;
  name: string;
  description: string;
  url: string | null;
  createdAt: string;
}

export interface PluginInput {
  name: string;
  description: string;
  about: string;
  skillMd?: string | null;
  url?: string | null;
}

const PLUGIN_CARD_FRAGMENT = gql`
  fragment PluginCard on Plugin {
    id
    name
    description
    url
    hasSkillMd
    createdAt
    updatedAt
    author {
      id
      name
      username
      image
    }
  }
`;

export const PLUGINS_QUERY = gql`
  query Plugins($query: String, $first: Int, $after: String) {
    plugins(query: $query, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...PluginCard
        }
      }
    }
  }
  ${PLUGIN_CARD_FRAGMENT}
`;

export const PLUGIN_QUERY = gql`
  query Plugin($id: ID!) {
    plugin(id: $id) {
      ...PluginCard
      about
    }
  }
  ${PLUGIN_CARD_FRAGMENT}
`;

export const MY_PLUGINS_QUERY = gql`
  query MyPlugins {
    myPlugins(first: 50) {
      edges {
        node {
          ...PluginCard
          about
          skillMd
        }
      }
    }
  }
  ${PLUGIN_CARD_FRAGMENT}
`;

export const MY_PLUGIN_SUBMISSIONS_QUERY = gql`
  query MyPluginSubmissions {
    myPluginSubmissions(first: 50) {
      edges {
        node {
          id
          pluginId
          plugin {
            id
            name
          }
          status
          name
          description
          url
          createdAt
        }
      }
    }
  }
`;

export const SUBMIT_PLUGIN_MUTATION = gql`
  mutation SubmitPlugin($input: PluginInput!) {
    submitPlugin(input: $input) {
      id
      status
    }
  }
`;

export const SUBMIT_PLUGIN_UPDATE_MUTATION = gql`
  mutation SubmitPluginUpdate($pluginId: ID!, $input: PluginInput!) {
    submitPluginUpdate(pluginId: $pluginId, input: $input) {
      id
      status
    }
  }
`;

export const DELETE_PLUGIN_MUTATION = gql`
  mutation DeletePlugin($id: ID!) {
    deletePlugin(id: $id) {
      _
    }
  }
`;

export const CANCEL_PLUGIN_SUBMISSION_MUTATION = gql`
  mutation CancelPluginSubmission($id: ID!) {
    cancelPluginSubmission(id: $id) {
      _
    }
  }
`;

export interface PluginsData {
  plugins: Connection<Plugin>;
}

export interface PluginData {
  plugin: Plugin;
}

export const pluginsQueryOptions = (query?: string) => ({
  queryKey: generateQueryKey(RequestKey.Plugins, undefined, query ?? ''),
  queryFn: async (): Promise<Plugin[]> => {
    const { plugins } = await gqlClient.request<PluginsData>(PLUGINS_QUERY, {
      query: query || null,
      first: 50,
    });

    return plugins.edges.map(({ node }) => node);
  },
  staleTime: StaleTime.Default,
});

export const myPluginsQueryOptions = (userId?: string) => ({
  queryKey: generateQueryKey(
    RequestKey.MyPlugins,
    userId ? { id: userId } : undefined,
  ),
  queryFn: async (): Promise<Plugin[]> => {
    const { myPlugins } = await gqlClient.request<{
      myPlugins: Connection<Plugin>;
    }>(MY_PLUGINS_QUERY);

    return myPlugins.edges.map(({ node }) => node);
  },
  enabled: !!userId,
});

export const myPluginSubmissionsQueryOptions = (userId?: string) => ({
  queryKey: generateQueryKey(
    RequestKey.MyPluginSubmissions,
    userId ? { id: userId } : undefined,
  ),
  queryFn: async (): Promise<PluginSubmission[]> => {
    const { myPluginSubmissions } = await gqlClient.request<{
      myPluginSubmissions: Connection<PluginSubmission>;
    }>(MY_PLUGIN_SUBMISSIONS_QUERY);

    return myPluginSubmissions.edges.map(({ node }) => node);
  },
  enabled: !!userId,
});

export const getPluginSkillMdUrl = (id: string): string =>
  `${PLUGIN_API_BASE_URL}/${id}/skill.md`;
