import { createContext, useContext } from 'react';
import type { FeedSettingsEditContextValue } from './types';

export const FeedSettingsEditContext =
  createContext<FeedSettingsEditContextValue>(
    undefined as unknown as FeedSettingsEditContextValue,
  );

export const useFeedSettingsEditContext = (): FeedSettingsEditContextValue =>
  useContext(FeedSettingsEditContext);
