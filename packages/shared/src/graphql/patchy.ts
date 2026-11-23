import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

// As the API serves it. Strings stay loose on purpose: a value this client
// does not know (a new trigger, emote or face) is skipped, not an error.
export interface PatchyConfigResponse {
  awayHours: number;
  lateNight: { startHour: number; endHour: number };
  fridayDeploy: { startHour: number; endHour: number; tags: string[] };
  faces: { face: string; image: string }[];
  reactions: {
    trigger: string;
    enabled: boolean;
    emote: string;
    face: string;
  }[];
  moods: { mood: string; face: string; copy: string; label: string }[];
}

export const PATCHY_CONFIG_QUERY = gql`
  query PatchyConfig {
    patchyConfig {
      awayHours
      lateNight {
        startHour
        endHour
      }
      fridayDeploy {
        startHour
        endHour
        tags
      }
      faces {
        face
        image
      }
      reactions {
        trigger
        enabled
        emote
        face
      }
      moods {
        mood
        face
        copy
        label
      }
    }
  }
`;

export const patchyConfigQueryOptions = () => ({
  queryKey: generateQueryKey(RequestKey.PatchyConfig),
  queryFn: async (): Promise<PatchyConfigResponse> => {
    const { patchyConfig } = await gqlClient.request<{
      patchyConfig: PatchyConfigResponse;
    }>(PATCHY_CONFIG_QUERY);

    return patchyConfig;
  },
  staleTime: StaleTime.OneDay,
  // A miss only means this load keeps the cached or built-in config.
  retry: false,
  refetchOnWindowFocus: false,
});
