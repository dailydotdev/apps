import { useContext } from 'react';
import {
  SpotlightContext,
  type SpotlightContextValue,
} from './SpotlightContext';

export const useSpotlight = (): SpotlightContextValue => {
  const ctx = useContext(SpotlightContext);
  if (!ctx) {
    throw new Error('useSpotlight must be used within SpotlightProvider');
  }
  return ctx;
};
