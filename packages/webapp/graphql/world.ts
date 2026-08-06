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

/** Two free-form axes rather than a list of presets — neither carries a fact. */
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
 * What a user has made of their own world. Null fields mean unset; the client
 * owns every display default.
 */
export interface WorldSettings {
  name: string | null;
  sky: WorldSky | null;
  crest: WorldCrest | null;
  look: WorldLook | null;
  private: boolean;
  /**
   * A bare render of the world captured in the owner's browser. The share card
   * is composed around it server-side, so it carries no name, stats or chrome.
   *
   * Optional rather than nullable because this is server-owned and not part of
   * the dressing: the bench composes settings objects out of draft values, and
   * a draft has no plate to speak of.
   */
  plateUrl?: string | null;
  /** What the plate is a picture of, compared against the world to spot staleness. */
  plateVersion?: string | null;
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

export interface UploadUserWorldPlateData {
  uploadUserWorldPlate: WorldSettings | null;
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
    plateUrl
    plateVersion
  }
`;

/**
 * Districts and settings in one round trip — neither can draw without the
 * other. The growth log is NOT in here (tens of thousands of rows on a
 * long-tenured world; fetched separately). A private world comes back as
 * FORBIDDEN rather than an empty list, which is what distinguishes it from one
 * that is simply empty.
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

/** What the bench needs, not what displaying a world needs — asked for only once the owner opens it. */
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
 * Stores the render the share card is composed around. Takes no id: like every
 * world customisation it writes the caller's own row, which is what stops a
 * visitor putting an arbitrary image on someone else's card.
 */
export const UPLOAD_USER_WORLD_PLATE_MUTATION = gql`
  mutation UploadUserWorldPlate($image: Upload!, $version: String!) {
    uploadUserWorldPlate(image: $image, version: $version) {
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
