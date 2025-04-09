'use server';

import { cookies } from 'next/headers';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { FunnelBootResponse } from '@dailydotdev/shared/src/features/onboarding/types/funnelBoot';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';

async function setCookiesFromHeader(setCookieHeader: string) {
    if (!setCookieHeader) return;
  
    const cookieStore = await cookies();
    const cookiesArray = setCookieHeader
      .split(', ')
      .flatMap((cookie) => cookie.split(','));
  
    for (const cookie of cookiesArray) {
      const [cookieMain, ...cookieOptions] = cookie.split('; ');
      const [cookieName, cookieValue] = cookieMain.split('=');
  
      const options: { [key: string]: string | number | boolean | Date } = {};
  
      for (const option of cookieOptions) {
        if (option.includes('=')) {
          const [key, value] = option.split('=');
          if (key.toLowerCase() === 'expires') {
            options[key.toLowerCase()] = new Date(value);
          } else if (key.toLowerCase() === 'max-age') {
            options[key.toLowerCase()] = parseInt(value, 10);
          } else {
            options[key.toLowerCase()] = value;
          }
        } else {
          options[option.toLowerCase()] = true;
        }
      }
  
      await cookieStore.set({
        name: cookieName,
        value: cookieValue,
        ...options,
      });
    }
  }

  async function getFunnelBootData({
    app,
    cookies,
    id,
    version,
    apiUrl,
  }: {
    app: string;
    cookies: string;
    id?: string;
    version?: string;
    apiUrl: string;
  }): Promise<FunnelBootResponse> {
    const params = new URLSearchParams();
    if (id) params.append('id', id);
    if (version) params.append('v', version);
  
    const paramString = params.toString();
    const url = `${apiUrl}/boot/funnel${paramString ? `?${paramString}` : ''}`;
  
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        app,
        'Content-Type': 'application/json',
        ...(cookies && { Cookie: cookies }),
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

export async function funnelBootData(id: string, version: string, allCookies: string) {
  const bootResponse = await getFunnelBootData({
    app: BootApp.Webapp,
    cookies: allCookies,
    id,
    version,
    apiUrl,
  });

  const setCookieHeader = bootResponse.response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Call the server action to set the cookies
    await setCookiesFromHeader(setCookieHeader);
  }

  return bootResponse.data;
}
