import { useEffect } from 'react';
import {
  logGoToDevCardClick,
  logGoToDevCardImpression,
} from '../lib/analytics';

export type UseGenerateDevCardButtonReturn = [() => Promise<void>];

export default function useGoToDevCardButton(
  origin: string,
): UseGenerateDevCardButtonReturn {
  useEffect(() => {
    logGoToDevCardImpression(origin);
  }, []);

  return [() => logGoToDevCardClick(origin)];
}
