import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { useChecklist } from './useChecklist';
import { ActionType } from '../graphql/actions';
import { ChecklistStepType } from '../lib/checklist';

export const updateStep = (
  steps: ChecklistStepType[],
  index: number,
  update: Omit<Partial<ChecklistStepType>, 'action'> & {
    action: Partial<ChecklistStepType['action']>;
  },
): ChecklistStepType[] => {
  const step = steps[index];
  const updatedStep = {
    ...step,
    ...update,
    action: {
      ...step.action,
      ...update.action,
    },
  };

  const updatedSteps = [...steps];
  updatedSteps.splice(index, 1, updatedStep);

  return updatedSteps;
};

export const defaultSteps = [
  {
    title: 'Step 1',
    description: 'Step 1 description',
    action: {
      type: ActionType.CreateSquad,
      completedAt: new Date(),
    },
  },
  {
    title: 'Step 2',
    description: 'Step 2 description',
    action: {
      type: ActionType.EditWelcomePost,
      completedAt: new Date(),
    },
  },
  {
    title: 'Step 3',
    description: 'Step 3 description',
    action: {
      type: ActionType.SquadInvite,
      completedAt: new Date(),
    },
  },
];

describe('useChecklist hook', () => {
  let queryClient = new QueryClient();
  const wrapper = ({
    children,
  }: {
    steps: ChecklistStepType[];
    children: ReactNode;
  }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it('should show correct done status', async () => {
    let steps = [...defaultSteps];

    const { result, rerender } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    expect(result.current.isDone).toBe(true);
    expect(result.current.activeStep).toBeUndefined();
    expect(result.current.openStep).toBeNull();

    steps = updateStep(steps, 0, { action: { completedAt: null } });
    rerender({ steps });

    expect(result.current.isDone).toBe(false);
    expect(result.current.activeStep).toBe(steps[0].action.type);
    await waitFor(() => {
      expect(result.current.openStep).toBe(steps[0].action.type);
    });
  });

  it('should return completed steps', () => {
    let steps = [...defaultSteps];

    const { result, rerender } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    expect(result.current.completedSteps).toHaveLength(3);

    steps = updateStep(steps, 0, { action: { completedAt: null } });
    rerender({ steps });

    expect(result.current.completedSteps).toHaveLength(2);
  });

  it('should return first not completed step as active step', () => {
    const steps = [...defaultSteps].reduce(
      (acc, _, index) =>
        updateStep(acc, index, { action: { completedAt: null } }),
      defaultSteps,
    );

    const { result } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    expect(result.current.activeStep).toBe(steps[0].action.type);
  });

  it('should update active step after current active step is completed', () => {
    let steps = [...defaultSteps].reduce(
      (acc, _, index) =>
        updateStep(acc, index, { action: { completedAt: null } }),
      defaultSteps,
    );

    const { result, rerender } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    expect(result.current.activeStep).toBe(steps[0].action.type);

    steps = updateStep(steps, 0, { action: { completedAt: new Date() } });
    rerender({ steps: [...steps] });

    expect(result.current.activeStep).toBe(steps[1].action.type);
  });

  it('should return first not completed step as open step', async () => {
    const steps = [...defaultSteps].reduce(
      (acc, _, index) =>
        updateStep(acc, index, { action: { completedAt: null } }),
      defaultSteps,
    );

    const { result } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    await waitFor(() =>
      expect(result.current.openStep).toBe(steps[0].action.type),
    );
  });

  it('should open step after toggle', async () => {
    const steps = [...defaultSteps];

    const { result } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    expect(result.current.openStep).toBeNull();

    act(() => {
      result.current.onToggleStep(steps[0].action);
    });

    await waitFor(() =>
      expect(result.current.openStep).toBe(steps[0].action.type),
    );
  });

  it('should close step that is open after toggle', async () => {
    const steps = [...defaultSteps];

    const { result } = renderHook(
      (props: { steps: ChecklistStepType[] }) =>
        useChecklist({ steps: props.steps }),
      {
        wrapper,
        initialProps: {
          steps,
        },
      },
    );

    expect(result.current.openStep).toBeNull();

    act(() => {
      result.current.onToggleStep(steps[0].action);
    });

    await waitFor(() =>
      expect(result.current.openStep).toBe(steps[0].action.type),
    );

    act(() => {
      result.current.onToggleStep(steps[0].action);
    });

    await waitFor(() => expect(result.current.openStep).toBeNull());
  });
});
