import { atom } from 'jotai';
import { withHistory } from 'jotai-history';
import type {
  FunnelPosition,
  NonChapterStep,
  FunnelJSON,
} from '../types/funnel';

export const funnelPositionAtom = atom<FunnelPosition>({
  chapter: 0,
  step: 0,
});

export const funnelPositionHistoryAtom = withHistory(funnelPositionAtom, 100);

export function getFunnelStepByPosition(
  funnel: FunnelJSON,
  position: FunnelPosition,
): NonChapterStep | undefined {
  const firstLayer = funnel.steps?.[position.chapter];
  return 'steps' in firstLayer ? firstLayer.steps[position.step] : firstLayer;
}
