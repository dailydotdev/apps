import { atom } from 'jotai';
import type { Paddle } from '@paddle/paddle-js';
import type { FunnelPosition, FunnelStep, FunnelJSON } from '../types/funnel';

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

export const paddleInstanceAtom = atom<Paddle | undefined>();
export const selectedPlanAtom = atom<string | undefined>();
export const applyDiscountAtom = atom<boolean>(true);
export const discountTimerAtom = atom<Date | undefined>();
