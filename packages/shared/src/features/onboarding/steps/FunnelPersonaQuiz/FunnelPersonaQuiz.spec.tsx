import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FunnelPersonaQuiz } from './index';
import type { FunnelStepPersonaQuiz } from '../../types/funnel';
import { FunnelStepType, FunnelStepTransitionType } from '../../types/funnel';
import { LogEvent } from '../../../../lib/log';

jest.mock('../../../../graphql/common', () => ({
  gqlClient: { request: jest.fn().mockResolvedValue({ page: { edges: [] } }) },
}));

const mockFollowTags = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../../hooks/useMutateFilters', () => ({
  __esModule: true,
  default: () => ({
    followTags: mockFollowTags,
    unfollowTags: jest.fn(),
    blockTag: jest.fn(),
    unblockTag: jest.fn(),
    followSource: jest.fn(),
    unfollowSource: jest.fn(),
    blockSource: jest.fn(),
    unblockSource: jest.fn(),
    updateAdvancedSettings: jest.fn(),
    updateFeedFilters: jest.fn(),
  }),
}));

const mockLogEvent = jest.fn();
jest.mock('../../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: { id: 'u1', email: 'a@b.c' },
    trackingId: 'u1',
  }),
}));

jest.mock('../../../../hooks/useTagSearch', () => ({
  __esModule: true,
  MIN_SEARCH_QUERY_LENGTH: 2,
  useTagSearch: () => ({
    data: {
      searchTags: { tags: [{ name: 'graphql' }, { name: 'rust' }], query: '' },
    },
    isLoading: false,
  }),
}));

const parameters: FunnelStepPersonaQuiz['parameters'] = {
  entryQuestionId: 'q_domain',
  questions: [
    {
      id: 'q_domain',
      axis: 'domain',
      prompt: 'Where do you spend most time?',
      options: [
        {
          id: 'frontend',
          label: 'Frontend',
          tagWeights: { react: 1, tailwind: 1 },
          next: 'q_fe_yn',
        },
        {
          id: 'backend',
          label: 'Backend',
          tagWeights: { nodejs: 1, postgres: 1 },
          next: 'q_be_yn',
        },
      ],
    },
    {
      id: 'q_fe_yn',
      axis: 'fe_typescript',
      prompt: 'You write TypeScript.',
      options: [
        {
          id: 'yes',
          label: 'Yes',
          tagWeights: { typescript: 1 },
          next: null,
        },
        {
          id: 'no',
          label: 'No',
          tagWeights: { javascript: 1 },
          next: null,
        },
      ],
    },
    {
      id: 'q_be_yn',
      axis: 'be_go',
      prompt: 'Your main backend language is Go.',
      options: [
        {
          id: 'yes',
          label: 'Yes',
          tagWeights: { go: 1, golang: 1 },
          next: null,
        },
        {
          id: 'no',
          label: 'No',
          tagWeights: { python: 1 },
          next: null,
        },
      ],
    },
  ],
  selection: {
    maxQuestions: 10,
    targetTotalTags: 6,
    tagConfidenceFloor: 1,
    fallbackTags: ['javascript'],
  },
  revealLookup: {
    'q_domain:frontend|q_fe_yn:yes': {
      headline: 'TypeScript frontend dev',
      description: 'Heavy TS + React feed coming up.',
    },
  },
  reveal: {
    eyebrow: 'You are a…',
    cta: 'Looks good',
    feedbackCta: 'Nope, not me',
  },
};

const baseStep: FunnelStepPersonaQuiz = {
  id: 'persona-quiz-step',
  type: FunnelStepType.PersonaQuiz,
  transitions: [
    {
      on: FunnelStepTransitionType.Complete,
      destination: 'next',
    },
  ],
  isActive: true,
  parameters,
  onTransition: jest.fn(),
};

const renderStep = (overrides: Partial<FunnelStepPersonaQuiz> = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onTransition = jest.fn();
  const props = { ...baseStep, ...overrides, onTransition };
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <FunnelPersonaQuiz {...props} />
    </QueryClientProvider>,
  );
  return { ...utils, onTransition };
};

describe('FunnelPersonaQuiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs StartPersonaQuiz on mount', async () => {
    renderStep();
    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.StartPersonaQuiz }),
      );
    });
  });

  it('walks Q→A→reveal via static `next` pointers and emits Complete with payload', async () => {
    const { onTransition } = renderStep();
    fireEvent.click(await screen.findByText('Frontend'));
    fireEvent.click(await screen.findByText('Yes'));
    expect(
      await screen.findByText('TypeScript frontend dev'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Looks good'));
    await waitFor(() => {
      expect(mockFollowTags).toHaveBeenCalledWith({
        tags: expect.arrayContaining(['react', 'tailwind', 'typescript']),
      });
    });
    await waitFor(() => {
      expect(onTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FunnelStepTransitionType.Complete,
          details: expect.objectContaining({
            quizAnswers: [
              { questionId: 'q_domain', optionId: 'frontend' },
              { questionId: 'q_fe_yn', optionId: 'yes' },
            ],
          }),
        }),
      );
    });
  });

  it('falls back to a tag-based headline when the path is missing from the reveal lookup', async () => {
    renderStep();
    // backend → no → no reveal lookup entry for this path
    fireEvent.click(await screen.findByText('Backend'));
    fireEvent.click(await screen.findByText('No'));
    // Fallback headline composed from top humanised tags
    const heading = await screen.findByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(/Nodejs/);
    expect(heading).toHaveTextContent(/locked in/);
  });

  it('removes a tag from the chip list and excludes it from the final payload', async () => {
    const { onTransition } = renderStep();
    fireEvent.click(await screen.findByText('Frontend'));
    fireEvent.click(await screen.findByText('Yes'));
    const removeButton = await screen.findByRole('button', {
      name: 'Remove react',
    });
    fireEvent.click(removeButton);
    fireEvent.click(screen.getByText('Looks good'));
    await waitFor(() => {
      const lastCall = onTransition.mock.calls.at(-1)?.[0];
      expect(lastCall?.details?.tags).not.toContain('react');
    });
  });

  it('opens the feedback form and logs PersonaQuizFeedback with the reveal headline', async () => {
    renderStep();
    fireEvent.click(await screen.findByText('Frontend'));
    fireEvent.click(await screen.findByText('Yes'));
    fireEvent.click(await screen.findByText('Nope, not me'));
    const textarea = await screen.findByPlaceholderText(
      /Tell us what we got wrong/i,
    );
    fireEvent.change(textarea, { target: { value: "I'm a backend dev" } });
    fireEvent.click(screen.getByText('Send feedback'));
    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.PersonaQuizFeedback,
          extra: expect.stringContaining("I'm a backend dev"),
        }),
      );
    });
    const feedbackCall = mockLogEvent.mock.calls.find(
      ([call]) => call?.event_name === LogEvent.PersonaQuizFeedback,
    );
    expect(feedbackCall?.[0]?.extra).toContain('TypeScript frontend dev');
  });
});
