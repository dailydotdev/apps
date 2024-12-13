import { createContext } from 'react';
import { FeedSettingsEditContextValue } from './types';

export const FeedSettingsEditContext =
  createContext<FeedSettingsEditContextValue>(undefined);
