import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeedbackModal from './FeedbackModal';

const mockDisplayToast = jest.fn();
const mockSubmitFeedback = jest.fn();

jest.mock('../../graphql/feedback', () => ({
  ...jest.requireActual('../../graphql/feedback'),
  submitFeedback: (...args: unknown[]) => mockSubmitFeedback(...args),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({
    displayToast: mockDisplayToast,
    dismissToast: jest.fn(),
    subject: undefined,
  }),
}));

const renderComponent = () => {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <FeedbackModal isOpen onRequestClose={jest.fn()} ariaHideApp={false} />
    </QueryClientProvider>,
  );
};

describe('FeedbackModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="__next"></div>';
  });

  it('prevents duplicate submissions from rapid repeated clicks', async () => {
    mockSubmitFeedback.mockResolvedValue({ _: true });

    renderComponent();

    fireEvent.input(screen.getByPlaceholderText('Your feedback'), {
      target: { value: 'Needs better keyboard shortcuts' },
    });

    const submitButton = screen.getByRole('button', {
      name: 'Submit Feedback',
    });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitFeedback).toHaveBeenCalledTimes(1));
  });

  it('allows retry after submission error', async () => {
    mockSubmitFeedback.mockRejectedValueOnce(new Error('failed'));
    mockSubmitFeedback.mockResolvedValueOnce({ _: true });

    renderComponent();

    fireEvent.input(screen.getByPlaceholderText('Your feedback'), {
      target: { value: 'Submission should retry after errors' },
    });

    const submitButton = screen.getByRole('button', {
      name: 'Submit Feedback',
    });

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith(
        'Failed to submit feedback. Please try again.',
      ),
    );

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitFeedback).toHaveBeenCalledTimes(2));
  });
});
