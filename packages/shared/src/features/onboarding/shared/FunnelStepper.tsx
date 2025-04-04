import type { ReactElement, PropsWithChildren } from 'react';
import React from 'react';
import type { FunnelJSON } from '../types/funnel';
import { Header } from './Header';
import { useFunnelTracking } from '../hooks/useFunnelTracking';

interface FunnelStepperProps extends PropsWithChildren {
  funnel: FunnelJSON;
}

const initialState = {
  step: 0,
  chapters: [],
  chapter: 0,
};

const funnelReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREVIOUS_STEP':
      return { ...state, step: state.step - 1 };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

export const FunnelStepper = ({
  children,
  funnel,
}: FunnelStepperProps): ReactElement => {
  const [state, dispatch] = React.useReducer(funnelReducer, initialState);
  const { trackOnClickCapture, trackOnScroll } = useFunnelTracking();
  return (
    <section onClickCapture={trackOnClickCapture} onScroll={trackOnScroll}>
      <Header
        currentChapter={state.chapter}
        currentStep={state.step}
        chapters={state.chapters}
      />
    </section>
  );
};
