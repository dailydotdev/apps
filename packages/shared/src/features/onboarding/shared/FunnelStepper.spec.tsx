import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { FunnelStepper } from './FunnelStepper';
import { useFunnelNavigation } from '../hooks/useFunnelNavigation';
import { useFunnelTracking } from '../hooks/useFunnelTracking';
import { useStepTransition } from '../hooks/useStepTransition';
import {
  COMPLETED_STEP_ID,
  FunnelStepType,
  FunnelStepTransitionType,
  FunnelStepQuizQuestionType,
} from '../types/funnel';
import type { FunnelJSON, FunnelStep, FunnelStepQuiz } from '../types/funnel';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { StepHeadlineAlign } from './StepHeadline';
import type { FunnelSession } from '../types/funnelBoot';

// Mock all hooks used by the component
jest.mock('../hooks/useFunnelNavigation');
jest.mock('../hooks/useFunnelTracking');
jest.mock('../hooks/useStepTransition');
jest.mock('../../common/hooks/useWindowScroll', () => ({
  useWindowScroll: jest.fn(),
}));
jest.mock('jotai-history', () => ({
  withHistory: jest.fn(),
}));

let client: QueryClient;

describe('FunnelStepper component', () => {
  const mockNavigate = jest.fn();
  const mockBack = { navigate: jest.fn(), hasTarget: true };
  const mockSkip = { navigate: jest.fn(), hasTarget: true };
  const mockTrackOnClickCapture = jest.fn();
  const mockTrackOnHoverCapture = jest.fn();
  const mockTrackOnNavigate = jest.fn();
  const mockTrackOnScroll = jest.fn();
  const mockTrackOnComplete = jest.fn();
  const mockSendTransition = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnTransition = jest.fn();

  const mockStep: FunnelStepQuiz = {
    id: 'step1',
    type: FunnelStepType.Quiz,
    parameters: {
      question: {
        type: FunnelStepQuizQuestionType.Radio,
        text: 'Test question',
        options: [{ label: 'Option 1' }],
      },
      explainer: 'Test explainer',
    },
    transitions: [
      { on: FunnelStepTransitionType.Complete, destination: 'step2' },
      { on: FunnelStepTransitionType.Skip, destination: COMPLETED_STEP_ID },
    ],
    onTransition: mockOnTransition,
  };

  const mockFunnel: FunnelJSON = {
    id: 'test-funnel',
    version: 1,
    parameters: {},
    entryPoint: 'step1',
    chapters: [
      {
        id: 'chapter1',
        steps: [mockStep],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient();

    // Set up hook mocks
    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: mockSkip,
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 1 }],
      step: mockStep,
    });

    (useFunnelTracking as jest.Mock).mockReturnValue({
      trackOnClickCapture: mockTrackOnClickCapture,
      trackOnHoverCapture: mockTrackOnHoverCapture,
      trackOnNavigate: mockTrackOnNavigate,
      trackOnScroll: mockTrackOnScroll,
      trackOnComplete: mockTrackOnComplete,
      trackFunnelEvent: jest.fn(),
    });

    (useStepTransition as jest.Mock).mockReturnValue({
      transition: mockSendTransition,
    });
  });

  const renderComponent = (funnel = mockFunnel) => {
    render(
      <TestBootProvider client={client}>
        <FunnelStepper
          funnel={funnel}
          session={{ id: 'session-id' } as FunnelSession}
          onComplete={mockOnComplete}
        />
      </TestBootProvider>,
    );
  };

  it('should render correctly', () => {
    renderComponent();
    // Verify the Header is rendered
    expect(screen.getByTestId('funnel-stepper')).toBeInTheDocument();
  });

  it('should handle transition events correctly', async () => {
    renderComponent();

    const step = screen.getByTestId('funnel-step-quiz');
    expect(step).toBeInTheDocument();

    await act(async () => {
      const firstOption = screen.getByText('Option 1');
      fireEvent.click(firstOption);
      await waitForNock();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: 'step2',
      type: FunnelStepTransitionType.Complete,
    });
    expect(mockSendTransition).toHaveBeenCalledWith({
      fromStep: 'step1',
      toStep: 'step2',
      transitionEvent: FunnelStepTransitionType.Complete,
      inputs: { step1: 'Option 1' },
    });
  });

  it('should call onComplete when transitioning to the final step', async () => {
    renderComponent();

    const skipButton = screen.getByRole('button', { name: 'Skip' });
    expect(skipButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(skipButton);
      await waitForNock();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should not call onComplete for non-final step transitions', async () => {
    renderComponent();

    await act(async () => {
      const firstOption = screen.getByText('Option 1');
      fireEvent.click(firstOption);
      await waitForNock();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: 'step2',
      type: FunnelStepTransitionType.Complete,
    });
    expect(mockSendTransition).toHaveBeenCalled();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should set up tracking event handlers', () => {
    renderComponent();

    const section = screen.getByLabelText('Option 1');

    fireEvent.click(section);
    expect(mockTrackOnClickCapture).toHaveBeenCalled();

    fireEvent.mouseOver(section);
    expect(mockTrackOnHoverCapture).toHaveBeenCalled();

    fireEvent.scroll(section);
    expect(mockTrackOnScroll).toHaveBeenCalled();
  });

  it('should not show back button when hasTarget is false', () => {
    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: { navigate: mockBack.navigate, hasTarget: false },
      skip: mockSkip,
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 1 }],
      step: mockStep,
    });

    renderComponent();

    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('should not show skip button when hasTarget is false', () => {
    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: { navigate: mockSkip.navigate, hasTarget: false },
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 1 }],
      step: mockStep,
    });

    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Skip' }),
    ).not.toBeInTheDocument();
  });

  it('should only show the active step', () => {
    const quizStep: FunnelStepQuiz = {
      id: 'step1',
      type: FunnelStepType.Quiz,
      parameters: {
        question: {
          type: FunnelStepQuizQuestionType.Radio,
          text: 'Test question',
          options: [{ label: 'Option 1' }],
        },
        explainer: 'Test explainer',
      },
      transitions: [],
      onTransition: mockOnTransition,
    };

    const factStep: FunnelStep = {
      id: 'step2',
      type: FunnelStepType.Fact,
      parameters: {
        headline: 'Test headline',
        cta: 'Test CTA',
        explainer: 'Test explainer',
        align: StepHeadlineAlign.Left,
        visualUrl: 'https://example.com/image.jpg',
      },
      transitions: [],
      onTransition: mockOnTransition,
    };

    const mockFunnelWithMultipleSteps: FunnelJSON = {
      id: 'test-funnel',
      version: 1,
      parameters: {},
      entryPoint: 'step1',
      chapters: [
        {
          id: 'chapter1',
          steps: [quizStep, factStep],
        },
      ],
    };

    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: mockSkip,
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 2 }],
      step: quizStep,
    });

    renderComponent(mockFunnelWithMultipleSteps);

    // We should have one visible div and one hidden div
    const steps = screen.getAllByTestId('funnel-step');
    expect(steps.length).toBe(1);
  });
});
