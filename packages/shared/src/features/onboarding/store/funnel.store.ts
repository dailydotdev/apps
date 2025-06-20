import { atom } from 'jotai';
import type { FunnelPosition, FunnelStep, FunnelJSON } from '../types/funnel';
import { atomWithLocalStorage } from '../../common/lib/jotai';

export const funnelPositionAtom = atom<FunnelPosition>({
  chapter: 0,
  step: 0,
});

export function getFunnelStepByPosition(
  funnel: FunnelJSON,
  position: FunnelPosition,
): FunnelStep | undefined {
  return funnel.chapters[position.chapter].steps[position.step];
}

export const selectedPlanAtom = atom<string | undefined>();
export const applyDiscountAtom = atom<boolean>(true);
export const discountTimerAtom = atomWithLocalStorage<Date | undefined>({
  key: 'funnel-discount-timer',
  initialValue: undefined,
  parseFunction: (value) => (value ? new Date(value) : undefined),
});
