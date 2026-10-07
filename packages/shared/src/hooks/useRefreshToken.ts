import { useEffect, useRef } from 'react';
import type { AccessToken } from '../lib/boot';
import { ONE_MINUTE } from '../lib/time';

const REFRESH_BEFORE_EXPIRY = ONE_MINUTE * 2;
const MIN_REFRESH_INTERVAL = ONE_MINUTE;
const MIN_DELAY = 200;
// setTimeout overflows above this value and fires immediately
const MAX_DELAY = 2 ** 31 - 1;

export function useRefreshToken(
  accessToken: AccessToken | undefined,
  refresh: () => Promise<unknown>,
): void {
  const refreshRef = useRef(refresh);
  const lastRefreshRef = useRef(0);
  const token = accessToken?.token;
  const expiresIn = accessToken?.expiresIn;

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const now = Date.now();
    const expiresAt = (expiresIn && new Date(expiresIn).getTime()) || now;
    const refreshAt = Math.max(
      expiresAt - REFRESH_BEFORE_EXPIRY,
      lastRefreshRef.current + MIN_REFRESH_INTERVAL,
      now + MIN_DELAY,
    );
    const timeout = window.setTimeout(() => {
      lastRefreshRef.current = Date.now();
      refreshRef.current();
    }, Math.min(refreshAt - now, MAX_DELAY));

    return () => window.clearTimeout(timeout);
  }, [token, expiresIn]);
}
