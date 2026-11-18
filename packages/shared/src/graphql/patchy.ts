import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

// As the API serves it. Strings stay loose on purpose: a value this client
// does not know (a new trigger, emote or face) is skipped, not an error.
export interface PatchyConfigResponse {
  cooldownSeconds: number;
  awayHours: number;
  lateNight: { startHour: number; endHour: number };
  fridayDeploy: { startHour: number; endHour: number; tags: string[] };
  faces: { face: string; image: string }[];
  reactions: {
    trigger: string;
    enabled: boolean;
    poseImage: string;
    emote: string;
    face: string;
    priority: number;
    ttlSeconds: number;
  }[];
  moods: { mood: string; face: string; copy: string; label: string }[];
  den: {
    idleImage: string;
    blinkImage: string;
    laughImage: string;
    boneImage: string;
    asleepImage: string;
    sideeyeImage: string;
  };
}

export const PATCHY_CONFIG_QUERY = gql`
  query PatchyConfig {
    patchyConfig {
      cooldownSeconds
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
        poseImage
        emote
        face
        priority
        ttlSeconds
      }
      moods {
        mood
        face
        copy
        label
      }
      den {
        idleImage
        blinkImage
        laughImage
        boneImage
        asleepImage
        sideeyeImage
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
