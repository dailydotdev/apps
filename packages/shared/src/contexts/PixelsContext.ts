import { createContext } from 'react';
import type { LoggedUser } from '../lib/user';

export interface PixelsContextData {
  trackSignup: (user: LoggedUser) => void;
  trackPayment: (
    value: number,
    currency: string,
    transactionId: string,
  ) => void;
  trackEvent: (eventName: string) => void;
}

export const PixelsContext = createContext<PixelsContextData>({
  trackSignup() {},
  trackPayment() {},
  trackEvent() {},
});
