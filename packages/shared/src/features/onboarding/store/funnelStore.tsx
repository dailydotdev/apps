import { atom } from 'jotai';
import type { FunnelPosition, NonChapterStep } from '../types/funnel';

export const funnelPositionAtom = atom<FunnelPosition>({
  chapter: 0,
  step: 0,
});

export const funnelStepAtom = atom<NonChapterStep | undefined>(undefined);

export const funnelAtom = atom<{
  position: FunnelPosition;
  step?: NonChapterStep;
}>((get) => ({
  position: get(funnelPositionAtom),
  step: get(funnelStepAtom),
}));
