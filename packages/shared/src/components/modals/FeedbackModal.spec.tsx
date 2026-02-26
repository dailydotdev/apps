import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FeedbackModal from './FeedbackModal';

const mockUseMutation = jest.fn();
const mockDisplayToast = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({
    displayToast: mockDisplayToast,
    dismissToast: jest.fn(),
    subject: undefined,
  }),
}));

const createMutationResult = (mutate: jest.Mock) => ({
  context: undefined,
  data: undefined,
  error: null,
  failureCount: 0,
  failureReason: null,
  isError: false,
  isIdle: false,
  isPaused: false,
  isPending: false,
  isSuccess: false,
  mutate,
  mutateAsync: jest.fn(),
  reset: jest.fn(),
  status: 'idle',
  submittedAt: 0,
  variables: undefined,
});

describe('FeedbackModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="__next"></div>';
  });

  it('prevents duplicate submissions from rapid repeated clicks', () => {
    const mutate = jest.fn();

    mockUseMutation.mockImplementation(() => createMutationResult(mutate));

    render(
      <FeedbackModal isOpen onRequestClose={jest.fn()} ariaHideApp={false} />,
    );

    fireEvent.input(screen.getByPlaceholderText('Your feedback'), {
      target: { value: 'Needs better keyboard shortcuts' },
    });

    const submitButton = screen.getByRole('button', {
      name: 'Submit Feedback',
    });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('allows retry after submission error', () => {
    const mutate = jest.fn();

    mockUseMutation.mockImplementation((options: { onError?: () => void }) => {
      mutate.mockImplementation(() => options.onError?.());
      return createMutationResult(mutate);
    });

    render(
      <FeedbackModal isOpen onRequestClose={jest.fn()} ariaHideApp={false} />,
    );

    fireEvent.input(screen.getByPlaceholderText('Your feedback'), {
      target: { value: 'Submission should retry after errors' },
    });

    const submitButton = screen.getByRole('button', {
      name: 'Submit Feedback',
    });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Failed to submit feedback. Please try again.',
    );
  });
});
