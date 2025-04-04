import type { ReactElement, PropsWithChildren } from 'react';
import React from 'react';
import type { FunnelJSON } from '../types/funnel';
import { Header } from './Header';
import { useLogContext } from '../../../contexts/LogContext';

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
    case 'NEXT':
      return { ...state, step: state.step + 1 };
    case 'PREVIOUS':
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
  const { logEvent } = useLogContext();

  const handleClickTracking = (event: React.MouseEvent<HTMLElement>) => {
    console.log('Funnel stepper clicked');

    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const trackedElement = event.target.closest('[data-tracking]');

    if (!trackedElement) {
      return;
    }

    console.log('Funnel stepper tracking event:', {}, logEvent);
  };

  return (
    <section onClickCapture={handleClickTracking}>
      <Header
        currentChapter={state.chapter}
        currentStep={state.step}
        chapters={state.chapters}
      />
    </section>
  );
};
