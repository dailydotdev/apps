import { createContext, useContext } from 'react';
import type { FeedSettingsEditContextValue } from './types';

export const FeedSettingsEditContext =
  createContext<FeedSettingsEditContextValue>(undefined);

export const useFeedSettingsEditContext = (): FeedSettingsEditContextValue =>
  useContext(FeedSettingsEditContext);
