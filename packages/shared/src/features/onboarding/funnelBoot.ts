import { apiUrl } from '../../lib/config';
import type { FunnelBootResponse } from './types/funnelBoot';

export async function getFunnelBootData({
  app,
  cookies,
  id,
  version,
  forwardedHeaders,
}: {
  app: string;
  cookies: string;
  id?: string;
  version?: string;
  forwardedHeaders?: Record<string, string>;
}): Promise<FunnelBootResponse> {
  const params = new URLSearchParams();
  if (id) {
    params.append('id', id);
  }
  if (version) {
    params.append('v', version);
  }

  const paramString = params.toString();
  const url = `${apiUrl}/boot/funnel${paramString ? `?${paramString}` : ''}`;

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
