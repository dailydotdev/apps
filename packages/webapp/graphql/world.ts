import { gql } from 'graphql-request';

export interface WorldNiche {
  slug: string;
}

export interface WorldDistrict {
  niche: WorldNiche;
  reads: number;
  firstReadAt: string;
  lastReadAt: string;
  activeDays: number;
}

export interface WorldGrowth {
  date: string;
  niche: WorldNiche;
  reads: number;
}

export interface UserWorldTimelineData {
  userWorldTimeline: WorldGrowth[];
}

/**
 * Two axes rather than a list, because two axes is what makes a sky feel found
 * instead of picked. Neither carries a fact: the sky used to be a readout of
 * what you had been reading lately, and that is exactly the thing it was freed
 * from so it could be given away.
 */
export interface WorldSky {
  /** brand, clear, blossom, ember, seaglass, orchid, harvest or slate. */
  pal: string;
  /** Where the sun sits: dawn, day, gold, dusk or night. */
  hour: string;
}

export interface WorldCrest {
  /** Signature of a monument the owner has raised. */
  charge: string;
  div: string;
  /** Field tincture, as a 24-bit RGB integer. */
  a: number;
  b: number;
}

export interface WorldLookFx {
  post: boolean;
  bloom: boolean;
  outline: boolean;
}

/** The seven knobs that fork a preset into a look of your own. */
export type WorldLookKnob =
  | 'ol'
  | 'bl'
  | 'duo'
  | 'warm'
  | 'sat'
  | 'grain'
  | 'vig';

export interface WorldLook {
  id: string;
  /** The preset this was forked from, so reverting has somewhere to go. */
  base: string;
  mine: boolean;
  name: string;
  ol: number;
  bl: number;
  duo: number;
  warm: number;
  sat: number;
  grain: number;
  vig: number;
  lift: number;
  duoA: number;
  duoB: number;
  ink: number;
  fx: WorldLookFx;
}

/**
 * What a user has made of their own world. Every field is null until they
 * change it, and the client owns every display default — it has to render a
 * world with no settings at all, so a second set of defaults on the API side
 * would only be a copy that could disagree with this one.
 */
export interface WorldSettings {
  name: string | null;
  sky: WorldSky | null;
  crest: WorldCrest | null;
  look: WorldLook | null;
  private: boolean;
}

/** What granted an entitlement: `base`, or `niche:<slug>`. */
export interface WorldEntitlement {
  kind: 'charge' | 'tincture' | string;
  /** A charge signature, or a tincture as `#rrggbb`. */
  id: string;
  source: string;
}

export interface UserWorldData {
  userWorld: WorldDistrict[];
  userWorldSettings: WorldSettings | null;
}

export interface UserWorldEntitlementsData {
  userWorldEntitlements: WorldEntitlement[];
}

export interface UpdateUserWorldSettingsData {
  updateUserWorldSettings: WorldSettings | null;
}

const WORLD_SETTINGS_FRAGMENT = gql`
  fragment WorldSettings on UserWorldSettings {
    name
    sky {
      pal
      hour
    }
    crest {
      charge
      div
      a
      b
    }
    look {
      id
      base
      mine
      name
      ol
      bl
      duo
      warm
      sat
      grain
      vig
      lift
      duoA
      duoB
      ink
      fx {
        post
        bloom
        outline
      }
    }
    private
  }
`;

/**
 * Everything the world needs to stand up, in one round trip.
 *
 * The two halves are asked for together because neither can draw without the
 * other: the districts decide what is standing, and the settings decide what it
 * is photographed through and what flies over it — so fetching them separately
 * means either a frame of the wrong look or a second wait before the first one.
 * The growth log is NOT in here: it is the same world's whole history, tens of
 * thousands of rows, and the world stands without it.
 *
 * The settings are asked for on every world, not just your own — a look belongs
 * to the place rather than to whoever is looking at it. They are also the only
 * thing that can tell a private world from an empty one: privacy is applied to
 * the districts in SQL, so both come back as an empty list, and this errors with
 * FORBIDDEN instead.
 */
export const USER_WORLD_QUERY = gql`
  query UserWorld($id: ID!) {
    userWorld(id: $id) {
      niche {
        slug
      }
      reads
      firstReadAt
      lastReadAt
      activeDays
    }
    userWorldSettings(id: $id) {
      ...WorldSettings
    }
  }
  ${WORLD_SETTINGS_FRAGMENT}
`;

/**
 * What the bench needs rather than what displaying a world needs, which is why
 * it is separate and only ever asked for once the owner opens the bench.
 */
export const USER_WORLD_ENTITLEMENTS_QUERY = gql`
  query UserWorldEntitlements($id: ID!) {
    userWorldEntitlements(id: $id) {
      kind
      id
      source
    }
  }
`;

export const UPDATE_USER_WORLD_SETTINGS_MUTATION = gql`
  mutation UpdateUserWorldSettings(
    $name: String
    $sky: UserWorldSkyInput
    $crest: UserWorldCrestInput
    $look: UserWorldLookInput
    $private: Boolean
  ) {
    updateUserWorldSettings(
      name: $name
      sky: $sky
      crest: $crest
      look: $look
      private: $private
    ) {
      ...WorldSettings
    }
  }
  ${WORLD_SETTINGS_FRAGMENT}
`;

/**
 * Separate from the districts query on purpose: a long-tenured world runs to
 * tens of thousands of rows here and to at most forty there, so the world can
 * be standing while its history is still on the wire. Only `slug` is selected:
 * the renderer keys districts by slug, and every other field would be the same
 * forty values repeated across every row of the log.
 */
export const USER_WORLD_TIMELINE_QUERY = gql`
  query UserWorldTimeline($id: ID!) {
    userWorldTimeline(id: $id) {
      date
      niche {
        slug
      }
      reads
    }
  }
`;
