import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { FunnelStepper } from './FunnelStepper';
import { useFunnelNavigation } from '../hooks/useFunnelNavigation';
import { useFunnelTracking } from '../hooks/useFunnelTracking';
import { useStepTransition } from '../hooks/useStepTransition';
import {
  COMPLETED_STEP_ID,
  NEXT_STEP_ID,
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
jest.mock('../hooks/useFunnelNavigation', () => {
  const actual = jest.requireActual('../hooks/useFunnelNavigation');
  return {
    ...actual,
    useFunnelNavigation: jest.fn(), // Only mock the hook, keep getNextStep real
  };
});
jest.mock('../hooks/useFunnelTracking');
jest.mock('../hooks/useStepTransition');

let client: QueryClient;

describe('FunnelStepper component', () => {
  const mockNavigate = jest.fn();
  const mockBack = { navigate: jest.fn(), hasTarget: true };
  const mockSkip = { hasTarget: true };
  const mockTrackOnClickCapture = jest.fn();
  const mockTrackOnHoverCapture = jest.fn();
  const mockTrackOnNavigate = jest.fn();
  const mockTrackOnScroll = jest.fn();
  const mockTrackOnComplete = jest.fn();
  const mockSendTransition = jest.fn();
  const mockOnComplete = jest.fn();

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
  } as FunnelStepQuiz;

  const mockStep2: FunnelStep = {
    id: 'step2',
    type: FunnelStepType.Fact,
    parameters: {
      headline: 'Step 2 Headline',
      cta: 'Continue',
      explainer: 'Step 2 explainer',
      align: StepHeadlineAlign.Left,
    },
    transitions: [
      { on: FunnelStepTransitionType.Complete, destination: COMPLETED_STEP_ID },
    ],
  } as FunnelStep;

  const mockFunnel: FunnelJSON = {
    id: 'test-funnel',
    version: 1,
    parameters: {},
    entryPoint: 'step1',
    chapters: [
      {
        id: 'chapter1',
        steps: [mockStep, mockStep2],
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
      chapters: [{ steps: 2 }],
      step: mockStep,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
      },
      isReady: true,
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
    return render(
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
      details: { step1: 'Option 1' },
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
      details: { step1: 'Option 1' },
    });
    expect(mockSendTransition).toHaveBeenCalledWith({
      fromStep: 'step1',
      toStep: 'step2',
      transitionEvent: FunnelStepTransitionType.Complete,
      inputs: { step1: 'Option 1' },
    });
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
      chapters: [{ steps: 2 }],
      step: mockStep,
      isReady: true,
    });

    renderComponent();

    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
  });

  it('should not show skip button when hasTarget is false', () => {
    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: { hasTarget: false },
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 2 }],
      step: mockStep,
      isReady: true,
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
    } as FunnelStepQuiz;

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
    } as FunnelStep;

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
      isReady: true,
    });

    renderComponent(mockFunnelWithMultipleSteps);

    // We should have one visible div and one hidden div
    const steps = screen.getAllByTestId('funnel-step');
    expect(steps.length).toBe(1);
  });

  it('should handle NEXT_STEP_ID transitions correctly', async () => {
    // Test the edge case where transition uses NEXT_STEP_ID instead of explicit step ID
    const stepWithNextTransition: FunnelStepQuiz = {
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
        { on: FunnelStepTransitionType.Complete, destination: NEXT_STEP_ID }, // Using NEXT_STEP_ID
        { on: FunnelStepTransitionType.Skip, destination: COMPLETED_STEP_ID },
      ],
    } as FunnelStepQuiz;

    const funnelWithNext: FunnelJSON = {
      id: 'test-funnel',
      version: 1,
      parameters: {},
      entryPoint: 'step1',
      chapters: [
        {
          id: 'chapter1',
          steps: [stepWithNextTransition, mockStep2],
        },
      ],
    };

    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: mockSkip,
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 2 }],
      step: stepWithNextTransition,
      isReady: true,
    });

    renderComponent(funnelWithNext);

    await act(async () => {
      const firstOption = screen.getByText('Option 1');
      fireEvent.click(firstOption);
      await waitForNock();
    });

    // Should resolve NEXT_STEP_ID to "step2"
    expect(mockNavigate).toHaveBeenCalledWith({
      to: 'step2',
      type: FunnelStepTransitionType.Complete,
      details: { step1: 'Option 1' },
    });
    expect(mockSendTransition).toHaveBeenCalledWith({
      fromStep: 'step1',
      toStep: 'step2',
      transitionEvent: FunnelStepTransitionType.Complete,
      inputs: { step1: 'Option 1' },
    });
  });

  it('should render only steps that are not skipped', () => {
    // Test that steps marked to be skipped don't render
    // This tests the conditional step logic we implemented
    const normalStep: FunnelStepQuiz = {
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
      ],
    } as FunnelStepQuiz;

    // PWA install step that should be conditionally rendered
    const conditionalStep: FunnelStep = {
      id: 'step2',
      type: FunnelStepType.InstallPwa,
      parameters: {
        headline: 'Install PWA',
      },
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
      ],
    } as FunnelStep;

    const funnelWithConditional: FunnelJSON = {
      id: 'test-funnel',
      version: 1,
      parameters: {},
      entryPoint: 'step1',
      chapters: [
        {
          id: 'chapter1',
          steps: [normalStep, conditionalStep],
        },
      ],
    };

    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: mockSkip,
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 2 }],
      step: normalStep,
      isReady: true,
    });

    renderComponent(funnelWithConditional);

    // Both steps should be in DOM but only active one visible
    expect(screen.getByTestId('funnel-step-quiz')).toBeInTheDocument();

    // The PWA step exists but is hidden (not active)
    const hiddenSteps = screen.getAllByTestId('funnel-step');
    expect(hiddenSteps.length).toBe(1); // Only non-active steps get this testid
  });

  it('should use complete transition when step is automatically skipped', () => {
    // Test correct behavior: automatic skipping treats step as "auto-completed"
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    // Create steps in a sequence
    const firstStep = {
      id: 'step1',
      type: FunnelStepType.Quiz,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step2' },
      ],
    };

    const skippableStep = {
      id: 'step2', // This step will be automatically skipped
      type: FunnelStepType.InstallPwa,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step3' }, // Complete goes to step3
        { on: FunnelStepTransitionType.Skip, destination: COMPLETED_STEP_ID }, // Skip goes to end
      ],
    };

    const finalStep = {
      id: 'step3',
      type: FunnelStepType.Fact,
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
      ],
    };

    const allSteps = [firstStep, skippableStep, finalStep];
    const shouldSkipMap = { [FunnelStepType.InstallPwa]: true }; // step2 should be auto-skipped
    const context = {
      chapters: [{ steps: 3 }],
      position: { chapter: 0, step: 1 }, // Currently at step2 (index 1)
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // When step2 is automatically skipped, should use Complete transition → step3
    // NOT Skip transition → COMPLETED_STEP_ID (that's for manual skipping)
    const result = mockGetNextStep({
      destination: 'step2',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    expect(result).toBe('step3'); // Complete transition destination, not skip transition
  });

  it('should update context position when processing recursive auto-skipped steps with NEXT_STEP_ID', () => {
    // Test the context position update bug fix
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    const step1 = {
      id: 'step1',
      type: FunnelStepType.Quiz,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step2' },
      ],
    };

    const skippableStep2 = {
      id: 'step2', // This step will be auto-skipped
      type: FunnelStepType.InstallPwa,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: NEXT_STEP_ID }, // Uses NEXT_STEP_ID!
      ],
    };

    const step3 = {
      id: 'step3',
      type: FunnelStepType.Fact,
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
      ],
    };

    const allSteps = [step1, skippableStep2, step3];
    const shouldSkipMap = { [FunnelStepType.InstallPwa]: true }; // step2 should be auto-skipped

    // Context shows we're currently at step1 (chapter 0, step 0)
    const context = {
      chapters: [{ steps: 3 }],
      position: { chapter: 0, step: 0 }, // Currently at step1
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // When step2 is auto-skipped, its Complete destination is NEXT_STEP_ID
    // This should resolve based on step2's position (chapter 0, step 1), not step1's position
    // So NEXT_STEP_ID from step2 should resolve to step3
    const result = mockGetNextStep({
      destination: 'step2',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    expect(result).toBe('step3'); // Should correctly resolve NEXT_STEP_ID from step2's position
  });

  it('should handle automatic skipping at end of chapter/funnel', () => {
    // Test edge case: step that should be skipped is at the end of funnel
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    const finalSkippableStep = {
      id: 'final-step',
      type: FunnelStepType.InstallPwa,
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
        { on: FunnelStepTransitionType.Skip, destination: COMPLETED_STEP_ID },
      ],
    };

    const allSteps = [finalSkippableStep];
    const shouldSkipMap = { [FunnelStepType.InstallPwa]: true };
    const context = {
      chapters: [{ steps: 1 }],
      position: { chapter: 0, step: 0 }, // Last step in chapter
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // When final step is automatically skipped, should complete the funnel
    const result = mockGetNextStep({
      destination: 'final-step',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    expect(result).toBe(COMPLETED_STEP_ID);
  });

  it('should handle multiple chained auto-skipped steps', () => {
    // Test cascading auto-skip: step1 → step2 (skip) → step3 (skip) → step4 (valid)
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    const step1 = {
      id: 'step1',
      type: FunnelStepType.Quiz,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step2' },
      ],
    };

    const autoSkipStep2 = {
      id: 'step2',
      type: FunnelStepType.InstallPwa, // Auto-skipped
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step3' },
      ],
    };

    const autoSkipStep3 = {
      id: 'step3',
      type: FunnelStepType.BrowserExtension, // Also auto-skipped
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step4' },
      ],
    };

    const validStep4 = {
      id: 'step4',
      type: FunnelStepType.Fact,
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
      ],
    };

    const allSteps = [step1, autoSkipStep2, autoSkipStep3, validStep4];
    const shouldSkipMap = {
      [FunnelStepType.InstallPwa]: true,
      [FunnelStepType.BrowserExtension]: true,
    };
    const context = {
      chapters: [{ steps: 4 }],
      position: { chapter: 0, step: 0 },
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // Should cascade through: step2 (skip) → step3 (skip) → step4 (valid)
    const result = mockGetNextStep({
      destination: 'step2',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    expect(result).toBe('step4');
  });

  it('should handle auto-skip with explicit step destinations', () => {
    // Test auto-skip where Complete transition goes to explicit step ID, not NEXT_STEP_ID
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    const step1 = {
      id: 'step1',
      type: FunnelStepType.Quiz,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step2' },
      ],
    };

    const autoSkipStep2 = {
      id: 'step2',
      type: FunnelStepType.InstallPwa,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step4' }, // Jump to step4
      ],
    };

    const step3 = {
      id: 'step3',
      type: FunnelStepType.Fact,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step4' },
      ],
    };

    const step4 = {
      id: 'step4',
      type: FunnelStepType.ProfileForm,
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
      ],
    };

    const allSteps = [step1, autoSkipStep2, step3, step4];
    const shouldSkipMap = { [FunnelStepType.InstallPwa]: true };
    const context = {
      chapters: [{ steps: 4 }],
      position: { chapter: 0, step: 1 },
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // Auto-skipped step2 should jump directly to step4 (explicit destination)
    const result = mockGetNextStep({
      destination: 'step2',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    expect(result).toBe('step4');
  });

  it('should handle auto-skip chain ending in funnel completion', () => {
    // Test auto-skip where the Complete transition leads directly to COMPLETED_STEP_ID
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    const step1 = {
      id: 'step1',
      type: FunnelStepType.Quiz,
      transitions: [
        { on: FunnelStepTransitionType.Complete, destination: 'step2' },
      ],
    };

    const finalAutoSkipStep = {
      id: 'step2',
      type: FunnelStepType.InstallPwa,
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        }, // Directly to completion
      ],
    };

    const allSteps = [step1, finalAutoSkipStep];
    const shouldSkipMap = { [FunnelStepType.InstallPwa]: true };
    const context = {
      chapters: [{ steps: 2 }],
      position: { chapter: 0, step: 1 },
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // Auto-skipped step2 should complete the funnel directly
    const result = mockGetNextStep({
      destination: 'step2',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    expect(result).toBe(COMPLETED_STEP_ID);
  });

  it('should handle auto-skip step with no complete transition gracefully', () => {
    // Test edge case: auto-skipped step has no Complete transition
    const mockGetNextStep = jest.requireActual(
      '../hooks/useFunnelNavigation',
    ).getNextStep;

    const malformedAutoSkipStep = {
      id: 'malformed-step',
      type: FunnelStepType.InstallPwa,
      transitions: [
        // Only Skip transition, no Complete transition!
        { on: FunnelStepTransitionType.Skip, destination: COMPLETED_STEP_ID },
      ],
    };

    const allSteps = [malformedAutoSkipStep];
    const shouldSkipMap = { [FunnelStepType.InstallPwa]: true };
    const context = {
      chapters: [{ steps: 1 }],
      position: { chapter: 0, step: 0 },
      funnelChapters: [{ id: 'chapter1', steps: allSteps }],
    };

    // Should fallback gracefully when no Complete transition exists
    const result = mockGetNextStep({
      destination: 'malformed-step',
      steps: allSteps,
      shouldSkipMap,
      chapters: context.chapters,
      position: context.position,
      funnelChapters: context.funnelChapters,
      stepMap: {
        step1: { position: { chapter: 0, step: 0 } },
        step2: { position: { chapter: 0, step: 1 } },
        step3: { position: { chapter: 0, step: 2 } },
        step4: { position: { chapter: 0, step: 3 } },
        'final-step': { position: { chapter: 0, step: 0 } },
        'skippable-step': { position: { chapter: 0, step: 0 } },
        'malformed-step': { position: { chapter: 0, step: 0 } },
      },
    });

    // Should return the original step ID as fallback
    expect(result).toBe('malformed-step');
  });

  it('should handle transitions to non-existent steps gracefully', async () => {
    // Test edge case we encountered: transition pointing to step that doesn't exist
    const stepWithBadTransition: FunnelStepQuiz = {
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
        {
          on: FunnelStepTransitionType.Complete,
          destination: 'non-existent-step',
        },
      ],
    } as FunnelStepQuiz;

    const funnelWithBadTransition: FunnelJSON = {
      id: 'test-funnel',
      version: 1,
      parameters: {},
      entryPoint: 'step1',
      chapters: [
        {
          id: 'chapter1',
          steps: [stepWithBadTransition], // Only one step, pointing to non-existent step
        },
      ],
    };

    (useFunnelNavigation as jest.Mock).mockReturnValue({
      back: mockBack,
      skip: mockSkip,
      navigate: mockNavigate,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 1 }],
      step: stepWithBadTransition,
      isReady: true,
    });

    renderComponent(funnelWithBadTransition);

    await act(async () => {
      const firstOption = screen.getByText('Option 1');
      fireEvent.click(firstOption);
      await waitForNock();
    });

    // Should still try to navigate to the non-existent step (getNextStep returns the ID as-is)
    expect(mockNavigate).toHaveBeenCalledWith({
      to: 'non-existent-step',
      type: FunnelStepTransitionType.Complete,
      details: { step1: 'Option 1' },
    });
    expect(mockSendTransition).toHaveBeenCalledWith({
      fromStep: 'step1',
      toStep: 'non-existent-step',
      transitionEvent: FunnelStepTransitionType.Complete,
      inputs: { step1: 'Option 1' },
    });
  });
});
