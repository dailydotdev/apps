import { createContext, useContext } from 'react';
import type { LoggedUser } from '../lib/user';

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
    options?: { eventId?: string },
  ) => void;
}

export const PixelsContext = createContext<PixelsContextData>({
  trackSignup() {},
  trackPayment() {},
  trackEvent() {},
});

export const usePixelsContext = (): PixelsContextData =>
  useContext(PixelsContext);
