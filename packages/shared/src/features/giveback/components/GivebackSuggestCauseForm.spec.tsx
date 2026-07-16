import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GivebackSuggestCauseForm } from './GivebackSuggestCauseForm';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { useSuggestContributionCause } from '../hooks/useSuggestContributionCause';

jest.mock('../hooks/useSuggestContributionCause', () => ({
  useSuggestContributionCause: jest.fn(),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  ...jest.requireActual('../../../contexts/LogContext'),
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

const mockedUseSuggest = useSuggestContributionCause as jest.Mock;

beforeEach(() => {
  mockedUseSuggest.mockReturnValue({
    suggest: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  });
});

const renderForm = (
  onClose: () => void = jest.fn(),
): ReturnType<typeof render> => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <GivebackSuggestCauseForm onClose={onClose} origin="causes_tab" />
    </TestBootProvider>,
  );
};

it('keeps submit disabled until a valid URL is entered', () => {
  renderForm();

  const submit = screen.getByRole('button', { name: 'Submit for review' });
  expect(submit).toBeDisabled();

  fireEvent.change(screen.getByLabelText('Cause URL'), {
    target: { value: 'not a url' },
  });
  expect(submit).toBeDisabled();

  fireEvent.change(screen.getByLabelText('Cause URL'), {
    target: { value: 'https://example.org' },
  });
  expect(submit).toBeEnabled();
});

it('submits the url and optional note, then shows a confirmation', async () => {
  const suggest = jest.fn().mockResolvedValue(undefined);
  mockedUseSuggest.mockReturnValue({ suggest, isPending: false });
  renderForm();

  fireEvent.change(screen.getByLabelText('Cause URL'), {
    target: { value: 'https://example.org' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Tell us a bit/), {
    target: { value: 'they do great work' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

  await waitFor(() =>
    expect(suggest).toHaveBeenCalledWith({
      url: 'https://example.org',
      note: 'they do great work',
    }),
  );

  expect(
    await screen.findByText("Thanks, we'll take a look"),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Submit for review' }),
  ).not.toBeInTheDocument();
});

it('omits an empty note from the submission', async () => {
  const suggest = jest.fn().mockResolvedValue(undefined);
  mockedUseSuggest.mockReturnValue({ suggest, isPending: false });
  renderForm();

  fireEvent.change(screen.getByLabelText('Cause URL'), {
    target: { value: 'https://example.org' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));

  await waitFor(() =>
    expect(suggest).toHaveBeenCalledWith({
      url: 'https://example.org',
      note: undefined,
    }),
  );
});
