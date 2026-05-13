import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FunnelPersonaQuiz } from './index';
import type { FunnelStepPersonaQuiz } from '../../types/funnel';
import { FunnelStepType, FunnelStepTransitionType } from '../../types/funnel';
import { LogEvent } from '../../../../lib/log';
import {
  extractOnboardingTagsFromQuiz,
  fetchNextQuizQuestion,
} from '../../../../graphql/personaQuiz';

jest.mock('../../../../graphql/personaQuiz', () => ({
  extractOnboardingTagsFromQuiz: jest.fn(),
  fetchNextQuizQuestion: jest.fn(),
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
          signal: 'Frontend / UI craft',
          tagWeights: { react: 1, tailwind: 1 },
          next: 'q_fe_lang',
        },
        {
          id: 'backend',
          label: 'Backend',
          signal: 'Backend engineering',
          tagWeights: { node: 1, postgres: 1 },
          next: 'q_be_lang',
        },
      ],
    },
    {
      id: 'q_fe_lang',
      axis: 'language',
      prompt: 'Favorite frontend language?',
      options: [
        {
          id: 'ts',
          label: 'TypeScript',
          signal: 'TypeScript',
          tagWeights: { typescript: 1 },
        },
        {
          id: 'js',
          label: 'JavaScript',
          signal: 'JavaScript',
          tagWeights: { javascript: 1 },
        },
      ],
    },
    {
      id: 'q_be_lang',
      axis: 'language',
      prompt: 'Favorite backend language?',
      options: [
        {
          id: 'go',
          label: 'Go',
          signal: 'Go',
          tagWeights: { go: 1 },
        },
        {
          id: 'python',
          label: 'Python',
          signal: 'Python',
          tagWeights: { python: 1 },
        },
      ],
    },
  ],
  selection: {
    minQuestions: 2,
    maxQuestions: 2,
    tagConfidenceFloor: 1,
  },
  enrichment: {
    enabled: true,
    targetTotalTags: 6,
    fallbackTags: ['javascript'],
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
    (extractOnboardingTagsFromQuiz as jest.Mock).mockResolvedValue({
      includeTags: ['react', 'tailwind', 'typescript', 'graphql'],
      reveal: {
        headline: 'Friday-shipper, refactor addict',
        description:
          'Feed tuned for someone who reads dev drama and ships anyway.',
      },
    });
    (fetchNextQuizQuestion as jest.Mock).mockResolvedValue({
      isFinal: true,
      question: null,
    });
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
    fireEvent.click(await screen.findByText('TypeScript'));
    expect(
      await screen.findByText('Friday-shipper, refactor addict'),
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
              { questionId: 'q_fe_lang', optionId: 'ts' },
            ],
          }),
        }),
      );
    });
  });

  it('passes the canonical `signal` (not the playful label) to the LLM as the answer', async () => {
    renderStep({
      parameters: {
        ...parameters,
        selection: { ...parameters.selection, maxQuestions: 3 },
      },
    });
    fireEvent.click(await screen.findByText('Frontend'));
    fireEvent.click(await screen.findByText('TypeScript'));
    await waitFor(() => {
      expect(extractOnboardingTagsFromQuiz).toHaveBeenCalled();
    });
    const [answers] = (extractOnboardingTagsFromQuiz as jest.Mock).mock
      .calls[0];
    expect(answers).toEqual([
      expect.objectContaining({
        questionId: 'q_domain',
        answer: 'Frontend / UI craft',
      }),
      expect.objectContaining({
        questionId: 'q_fe_lang',
        answer: 'TypeScript',
      }),
    ]);
  });

  it('falls back to seed + fallback tags when LLM extract fails', async () => {
    (extractOnboardingTagsFromQuiz as jest.Mock).mockRejectedValue(
      new Error('boom'),
    );
    const { onTransition } = renderStep();
    fireEvent.click(await screen.findByText('Backend'));
    fireEvent.click(await screen.findByText('Go'));
    expect(await screen.findByText('Looks good')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Looks good'));
    await waitFor(() => {
      expect(onTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            tags: expect.arrayContaining([
              'node',
              'postgres',
              'go',
              'javascript',
            ]),
          }),
        }),
      );
    });
  });

  it('removes a tag from the chip list and excludes it from the final payload', async () => {
    const { onTransition } = renderStep();
    fireEvent.click(await screen.findByText('Frontend'));
    fireEvent.click(await screen.findByText('TypeScript'));
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

  it('opens the feedback form and logs PersonaQuizFeedback with text and reveal headline', async () => {
    renderStep();
    fireEvent.click(await screen.findByText('Frontend'));
    fireEvent.click(await screen.findByText('TypeScript'));
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
    expect(feedbackCall?.[0]?.extra).toContain(
      'Friday-shipper, refactor addict',
    );
  });

  it('falls through to the LLM when a chosen option has no `next` pointer', async () => {
    (fetchNextQuizQuestion as jest.Mock).mockResolvedValueOnce({
      isFinal: false,
      question: {
        id: 'q_llm_1',
        axis: 'tooling',
        prompt: 'You spend more time in Cursor than VS Code',
        options: [
          {
            id: 'yes',
            label: 'Yes',
            signal: 'Cursor heavy user',
            tagWeights: { 'ai-tools': 1 },
          },
          {
            id: 'no',
            label: 'No',
            signal: 'Not a Cursor user',
            tagWeights: {},
          },
        ],
      },
    });
    renderStep({
      parameters: {
        ...parameters,
        questions: [
          {
            ...parameters.questions[0],
            options: parameters.questions[0].options.map((option) => ({
              ...option,
              next: null,
            })),
          },
        ],
        selection: { ...parameters.selection, maxQuestions: 3 },
      },
    });
    fireEvent.click(await screen.findByText('Frontend'));
    expect(
      await screen.findByText('You spend more time in Cursor than VS Code'),
    ).toBeInTheDocument();
    expect(fetchNextQuizQuestion).toHaveBeenCalled();
  });
});
