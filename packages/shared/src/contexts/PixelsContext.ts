import { createContext, useContext } from 'react';
import type { LoggedUser } from '../lib/user';

export interface PixelEventOptions {
  // Dedupes the event across the pixel and server-side reporting
  eventId?: string;
  // X Events Manager event id; the event goes to X only when it is set
  xEventId?: string;
  // Hashed by the X pixel to match the conversion to an X user
  email?: string;
}

export interface PixelsContextData {
  trackSignup: (user: LoggedUser) => void;
  trackPayment: (
    value: number,
    currency: string,
    transactionId: string,
  ) => void;
  trackEvent: (
    eventName: string,
    params?: Record<string, unknown>,
    options?: PixelEventOptions,
  ) => void;
}

export const PixelsContext = createContext<PixelsContextData>({
  trackSignup() {},
  trackPayment() {},
  trackEvent() {},
});

export const usePixelsContext = (): PixelsContextData =>
  useContext(PixelsContext);
