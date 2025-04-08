import { atom } from 'jotai';
import type {
  FunnelPosition,
  NonChapterStep,
  FunnelJSON,
} from '../types/funnel';

export const funnelPositionAtom = atom<FunnelPosition>({
  chapter: 0,
  step: 0,
});

export const funnelStepAtom = atom<NonChapterStep | undefined>(undefined);

export function getFunnelStepByPosition(
  funnel: FunnelJSON,
  position: FunnelPosition,
): NonChapterStep | undefined {
  console.log(
    funnel,
    funnel.steps,
    funnel.steps[position.chapter],
    funnel.steps[position.chapter]?.[position.step],
  );
  const firstLayer = funnel.steps?.[position.chapter];
  return 'steps' in firstLayer ? firstLayer.steps[position.step] : firstLayer;
}
