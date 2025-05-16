import { renderHook, act } from '@testing-library/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai/react';
import { useFunnelNavigation } from './useFunnelNavigation';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  NEXT_STEP_ID,
  FunnelStepType,
} from '../types/funnel';
import type { FunnelJSON, FunnelStepFact } from '../types/funnel';
import { StepHeadlineAlign } from '../shared/StepHeadline';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('jotai/react', () => ({
  useAtom: jest.fn(),
}));

describe('useFunnelNavigation', () => {
  // Mock implementations
  const mockSetPosition = jest.fn();
  const mockPush = jest.fn();

  const mockSearchParams = {
    get: jest.fn(),
    toString: jest.fn().mockReturnValue(''),
  };

  // Helper function to ensure proper type safety
  const createStep = (
    id: string,
    transitions: Array<{
      on: FunnelStepTransitionType;
      destination: string | typeof COMPLETED_STEP_ID | typeof NEXT_STEP_ID;
      placement?: 'default' | 'bottom' | 'top';
    }>,
    headline = `${id} headline`,
  ): FunnelStepFact => ({
    id,
    type: FunnelStepType.Fact,
    parameters: {
      headline,
      explainer: `${id} explainer`,
      align: StepHeadlineAlign.Center,
    },
    transitions,
    onTransition: jest.fn(),
  });

  const createMockFunnel = (): FunnelJSON => ({
    id: 'test-funnel',
    version: 1,
    parameters: {},
    entryPoint: 'step1',
    chapters: [
      {
        id: 'chapter1',
        steps: [
          createStep('step1', [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'step2',
            },
            {
              on: FunnelStepTransitionType.Skip,
              destination: 'step3',
              placement: 'bottom',
            },
          ]),
          createStep('step2', [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'step3',
            },
            {
              on: FunnelStepTransitionType.Skip,
              destination: NEXT_STEP_ID,
              placement: 'bottom',
            },
          ]),
          createStep('step3', [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'chapter2-step1',
            },
            {
              on: FunnelStepTransitionType.Skip,
              destination: COMPLETED_STEP_ID,
              placement: 'top',
            },
          ]),
        ],
      },
      {
        id: 'chapter2',
        steps: [
          createStep('chapter2-step1', [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'chapter2-step2',
            },
            {
              on: FunnelStepTransitionType.Skip,
              destination: NEXT_STEP_ID,
              placement: 'default',
            },
          ]),
          createStep('chapter2-step2', [
            {
              on: FunnelStepTransitionType.Complete,
              destination: COMPLETED_STEP_ID,
            },
          ]),
        ],
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocks with proper type casting
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (usePathname as jest.Mock).mockReturnValue('/onboarding');
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
    });

    (useAtom as jest.Mock).mockReturnValue([
      { chapter: 0, step: 0 }, // Initial position
      mockSetPosition,
    ]);

    mockSearchParams.get.mockReturnValue(null);
    mockSearchParams.toString.mockReturnValue('');
  });

  it('should initialize correctly', () => {
    const mockOnNavigation = jest.fn();
    const funnel = createMockFunnel();

    const { result } = renderHook(() =>
      useFunnelNavigation({
        funnel,
        initialStepId: null,
        onNavigation: mockOnNavigation,
      }),
    );

    expect(result.current).toMatchObject({
      isReady: true,
      position: { chapter: 0, step: 0 },
      chapters: [{ steps: 3 }, { steps: 2 }],
    });

    expect(result.current.step.id).toBe('step1');
    expect(mockPush).toHaveBeenCalledWith('/onboarding?stepId=step1', {
      scroll: true,
    });
  });

  it('should navigate to the specified step', () => {
    const mockOnNavigation = jest.fn();
    const funnel = createMockFunnel();

    jest.useFakeTimers();
    Date.now = jest.fn().mockReturnValue(1000);

    const { result } = renderHook(() =>
      useFunnelNavigation({
        funnel,
        initialStepId: null,
        onNavigation: mockOnNavigation,
      }),
    );

    Date.now = jest.fn().mockReturnValue(2000);

    act(() => {
      result.current.navigate({ to: 'step2' });
    });

    expect(mockSetPosition).toHaveBeenCalledWith({ chapter: 0, step: 1 });
    expect(mockOnNavigation).toHaveBeenCalledWith({
      from: 'step1',
      to: 'step2',
      timeDuration: 2000,
      type: FunnelStepTransitionType.Complete,
    });
    expect(mockPush).toHaveBeenCalledWith('/onboarding?stepId=step2', {
      scroll: true,
    });

    jest.useRealTimers();
  });

  describe('skip navigation', () => {
    it('should correctly identify skip with explicit destination', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      // The first step has explicit destination "step3" for skip
      expect(result.current.skip).toMatchObject({
        hasTarget: true,
        destination: 'step3',
        placement: 'bottom',
      });
    });

    it('should handle NEXT_STEP_ID when not in last step of chapter', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // Set position to step2 in first chapter
      (useAtom as jest.Mock).mockReturnValue([
        { chapter: 0, step: 1 }, // step2
        mockSetPosition,
      ]);

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      // step2 has NEXT_STEP_ID which should resolve to step3
      expect(result.current.skip).toMatchObject({
        hasTarget: true,
        destination: 'step3',
        placement: 'bottom',
      });
    });

    it('should handle NEXT_STEP_ID when in last step of chapter but not last chapter', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // First, update step3 to use NEXT_STEP_ID instead of an explicit chapter2-step1 destination
      const updatedFunnel = {
        ...funnel,
        chapters: [
          {
            ...funnel.chapters[0],
            steps: [
              funnel.chapters[0].steps[0],
              funnel.chapters[0].steps[1],
              createStep('step3', [
                {
                  on: FunnelStepTransitionType.Complete,
                  destination: 'chapter2-step1',
                },
                {
                  on: FunnelStepTransitionType.Skip,
                  destination: NEXT_STEP_ID, // Changed from COMPLETED_STEP_ID to NEXT_STEP_ID
                  placement: 'top',
                },
              ]),
            ],
          },
          funnel.chapters[1],
        ],
      };

      // Set position to step3 (last step of first chapter)
      (useAtom as jest.Mock).mockReturnValue([
        { chapter: 0, step: 2 }, // step3 (last step of first chapter)
        mockSetPosition,
      ]);

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel: updatedFunnel as FunnelJSON,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      // NEXT_STEP_ID from the last step of first chapter should resolve to first step of second chapter
      expect(result.current.skip).toMatchObject({
        hasTarget: true,
        destination: 'chapter2-step1',
        placement: 'top',
      });
    });

    it('should handle NEXT_STEP_ID when in last step of last chapter', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // Create a modified funnel with NEXT_STEP_ID in the last step
      const lastStep = createStep('chapter2-step2', [
        {
          on: FunnelStepTransitionType.Complete,
          destination: COMPLETED_STEP_ID,
        },
        {
          on: FunnelStepTransitionType.Skip,
          destination: NEXT_STEP_ID,
          placement: 'top',
        },
      ]);

      const modifiedFunnel = {
        ...funnel,
        chapters: [
          funnel.chapters[0],
          {
            ...funnel.chapters[1],
            steps: [funnel.chapters[1].steps[0], lastStep],
          },
        ],
      };

      // Set position to last step of last chapter
      (useAtom as jest.Mock).mockReturnValue([
        { chapter: 1, step: 1 }, // chapter2-step2
        mockSetPosition,
      ]);

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel: modifiedFunnel as FunnelJSON,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      // Last step with NEXT_STEP_ID should resolve to COMPLETED_STEP_ID
      expect(result.current.skip).toMatchObject({
        hasTarget: true,
        destination: COMPLETED_STEP_ID,
        placement: 'top',
      });
    });

    it('should handle COMPLETED_STEP_ID destination', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // Set position to step3 in chapter1
      (useAtom as jest.Mock).mockReturnValue([
        { chapter: 0, step: 2 }, // step3
        mockSetPosition,
      ]);

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      // step3 has COMPLETED_STEP_ID as skip destination
      expect(result.current.skip).toMatchObject({
        hasTarget: true,
        destination: COMPLETED_STEP_ID,
        placement: 'top',
      });
    });

    it('should indicate no skip target when step has no skip transition', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // Create a step with no skip transition
      const stepWithoutSkip = createStep('step1', [
        {
          on: FunnelStepTransitionType.Complete,
          destination: 'step2',
        },
        // No skip transition
      ]);

      // Modify the funnel
      const modifiedFunnel = {
        ...funnel,
        chapters: [
          {
            ...funnel.chapters[0],
            steps: [stepWithoutSkip, ...funnel.chapters[0].steps.slice(1)],
          },
          funnel.chapters[1],
        ],
      };

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel: modifiedFunnel as FunnelJSON,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      expect(result.current.skip).toMatchObject({
        hasTarget: false,
      });
    });
  });

  describe('back navigation', () => {
    it('should indicate back is available when not on first step', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // Set position to step2
      (useAtom as jest.Mock).mockReturnValue([
        { chapter: 0, step: 1 },
        mockSetPosition,
      ]);

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      expect(result.current.back).toMatchObject({
        hasTarget: true,
      });
    });

    it('should indicate back is not available on first step', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      // First step
      (useAtom as jest.Mock).mockReturnValue([
        { chapter: 0, step: 0 },
        mockSetPosition,
      ]);

      const { result } = renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      expect(result.current.back).toMatchObject({
        hasTarget: false,
      });
    });
  });

  describe('URL syncing', () => {
    it('should update position when URL stepId changes', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      mockSearchParams.get.mockReturnValue('step1');

      renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      // Change URL parameter to step2
      mockSearchParams.get.mockReturnValue('step2');

      // Re-render the hook to trigger the URL change detection
      renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: null,
          onNavigation: mockOnNavigation,
        }),
      );

      expect(mockSetPosition).toHaveBeenCalledWith({ chapter: 0, step: 1 });
    });

    it('should use initialStepId when provided', () => {
      const mockOnNavigation = jest.fn();
      const funnel = createMockFunnel();

      renderHook(() =>
        useFunnelNavigation({
          funnel,
          initialStepId: 'step2',
          onNavigation: mockOnNavigation,
        }),
      );

      expect(mockSetPosition).toHaveBeenCalledWith({ chapter: 0, step: 1 });
      expect(mockPush).toHaveBeenCalledWith('/onboarding?stepId=step2', {
        scroll: true,
      });
    });
  });
});
