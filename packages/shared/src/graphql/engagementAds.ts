import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type { LoggedUser } from '../lib/user';
import type { EngagementCreative } from '../lib/engagementAds';
import { getStoredConsentHeaders } from '../lib/tcf';

export const ENGAGEMENT_CREATIVES_QUERY = gql`
  query EngagementCreatives {
    engagementCreatives {
      gen_id
      promoted_name
      promoted_body
      promoted_cta
      promoted_url
      promoted_logo_img {
        dark
        light
      }
      promoted_icon_img {
        dark
        light
      }
      promoted_gradient_start {
        dark
        light
      }
      promoted_gradient_end {
        dark
        light
      }
      tools
      keywords
      tags
    }
  }
`;

/** Brand creatives that boot leaves out when asked with `engagement=lazy`. */
export const engagementCreativesQueryOptions = (
  user?: Pick<LoggedUser, 'id'>,
) => ({
  queryKey: generateQueryKey(RequestKey.EngagementCreatives, user),
  queryFn: async (): Promise<EngagementCreative[]> => {
    const res = await gqlClient.request<{
      engagementCreatives: EngagementCreative[];
    }>(ENGAGEMENT_CREATIVES_QUERY, undefined, getStoredConsentHeaders());

    return res.engagementCreatives;
  },
  staleTime: StaleTime.Default,
  retry: false,
});
