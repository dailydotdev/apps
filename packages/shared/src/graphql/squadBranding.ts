import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { Squad } from './sources';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

// A verified squad's branding: a brand colour and a header button, set by its
// admins in Manage › Branding. The API returns it empty for any other squad.

export interface SquadBrandingButton {
  label: string;
  url: string;
  enabled: boolean;
}

export interface SquadBranding {
  /** Hex, e.g. `#FF570A`. Colours the header gradient and the button. */
  color: string | null;
  button: SquadBrandingButton | null;
}

const SQUAD_BRANDING_FRAGMENT = gql`
  fragment SquadBrandingInfo on SourceBranding {
    color
    button {
      label
      url
      enabled
    }
  }
`;

export const SQUAD_BRANDING_QUERY = gql`
  query SquadBranding($handle: ID!) {
    source(id: $handle) {
      id
      branding {
        ...SquadBrandingInfo
      }
    }
  }
  ${SQUAD_BRANDING_FRAGMENT}
`;

/**
 * Its own query, not part of the squad's: verified squads only, and a missing
 * field (an API without branding yet) only costs the branding, never the page.
 */
export const squadBrandingQueryOptions = ({
  squad,
  user,
}: {
  squad?: Pick<Squad, 'handle' | 'features'>;
  user?: Pick<LoggedUser, 'id'>;
}) => ({
  queryKey: generateQueryKey(RequestKey.Squad, user, squad?.handle, 'branding'),
  queryFn: async (): Promise<SquadBranding> => {
    const res = await gqlClient.request<{
      source: { branding: SquadBranding };
    }>(SQUAD_BRANDING_QUERY, { handle: squad?.handle });

    return res.source.branding;
  },
  enabled: !!squad?.handle && !!squad?.features?.verified,
  staleTime: StaleTime.Default,
  retry: false,
});

const UPDATE_SQUAD_BRANDING_MUTATION = gql`
  mutation UpdateSquadBranding(
    $sourceId: ID!
    $color: String
    $button: SquadBrandingButtonInput
  ) {
    updateSquadBranding(sourceId: $sourceId, color: $color, button: $button) {
      id
      branding {
        ...SquadBrandingInfo
      }
    }
  }
  ${SQUAD_BRANDING_FRAGMENT}
`;

export interface UpdateSquadBrandingInput {
  sourceId: string;
  color: string | null;
  button: SquadBrandingButton | null;
}

export const updateSquadBranding = async (
  input: UpdateSquadBrandingInput,
): Promise<SquadBranding> => {
  const res = await gqlClient.request<{
    updateSquadBranding: { branding: SquadBranding };
  }>(UPDATE_SQUAD_BRANDING_MUTATION, input);

  return res.updateSquadBranding.branding;
};
