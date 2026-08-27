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

jest.mock('../../contexts/SettingsContext', () => ({
  useSettingsContext: () => ({ themeMode: 'dark' }),
}));

// jsdom implements neither object URLs nor canvas
const mockRevokePreviewUrl = jest.fn();
jest.mock('../../lib/screenshot', () => ({
  ...jest.requireActual('../../lib/screenshot'),
  createPreviewUrl: () => 'blob:mock-preview',
  revokePreviewUrl: (...args: unknown[]) => mockRevokePreviewUrl(...args),
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

  it('includes clientInfo in the mutation payload on submit', async () => {
    mockSubmitFeedback.mockResolvedValue({ _: true });

    renderComponent();

    fireEvent.input(screen.getByPlaceholderText('Your feedback'), {
      target: { value: 'Testing client info capture' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

    await waitFor(() =>
      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          clientInfo: expect.objectContaining({
            viewport: expect.any(String),
            screen: expect.any(String),
            theme: 'dark',
          }),
        }),
      ),
    );
  });

  it('lets the user crop an attached screenshot and cancel out', async () => {
    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Crop' }),
    ).not.toBeInTheDocument();

    const file = new File(['screenshot'], 'screenshot.png', {
      type: 'image/png',
    });
    fireEvent.change(screen.getByLabelText('Upload screenshot'), {
      target: { files: [file] },
    });

    const cropButton = await screen.findByRole('button', { name: 'Crop' });
    fireEvent.click(cropButton);

    expect(
      screen.getByText('Drag to select the area to keep'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply crop' })).toBeDisabled();
    // Cropping replaces the plain preview until it is applied or cancelled
    expect(screen.queryByAltText('Screenshot preview')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByText('Drag to select the area to keep'),
    ).not.toBeInTheDocument();
    expect(screen.getByAltText('Screenshot preview')).toBeInTheDocument();
  });

  it('keeps the existing attachment when a replacement file fails validation', async () => {
    renderComponent();

    const valid = new File(['screenshot'], 'screenshot.png', {
      type: 'image/png',
    });
    fireEvent.change(screen.getByLabelText('Upload screenshot'), {
      target: { files: [valid] },
    });
    await screen.findByAltText('Screenshot preview');

    const tooLarge = new File(['x'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(tooLarge, 'size', { value: 6 * 1024 * 1024 });
    fireEvent.change(screen.getByLabelText('Upload screenshot'), {
      target: { files: [tooLarge] },
    });

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith(
        'File too large. Maximum size is 5MB.',
      ),
    );
    // The original attachment and its preview URL must survive the rejection
    expect(screen.getByAltText('Screenshot preview')).toBeInTheDocument();
    expect(mockRevokePreviewUrl).not.toHaveBeenCalled();
  });

  it('renders all categories and submits content quality with updated enum value', async () => {
    mockSubmitFeedback.mockResolvedValue({ _: true });

    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Bug Report' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Feature Request' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'UX Issue' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Performance' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Content Quality' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Content Quality' }));
    fireEvent.input(screen.getByPlaceholderText('Your feedback'), {
      target: {
        value: 'Content quality is inconsistent across recommendations',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

    await waitFor(() =>
      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 7,
        }),
      ),
    );
  });
});
