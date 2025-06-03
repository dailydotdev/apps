import { apiUrl } from '../../lib/config';
import type { FunnelBootResponse } from './types/funnelBoot';

export enum FunnelBootFeatureKey {
  Funnel = 'funnel',
  Onboarding = 'onboarding',
}

export async function getFunnelBootData({
  app,
  cookies,
  id,
  version,
  forwardedHeaders,
  featureKey = FunnelBootFeatureKey.Funnel,
}: {
  app: string;
  cookies: string;
  id?: string;
  version?: string;
  forwardedHeaders?: Record<string, string>;
  featureKey?: FunnelBootFeatureKey;
}): Promise<FunnelBootResponse> {
  const params = new URLSearchParams();
  if (id) {
    params.append('id', id);
  }
  if (version) {
    params.append('v', version);
  }

  const paramString = params.toString();
  const url = `${apiUrl}/boot/funnels/${featureKey}${
    paramString ? `?${paramString}` : ''
  }`;

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      app,
      'Content-Type': 'application/json',
      ...(cookies && { Cookie: cookies }),
      ...forwardedHeaders,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch funnel boot data: ${res.status}`);
  }

  const data = await res.json();

  return {
    data,
    response: res,
  };
}
