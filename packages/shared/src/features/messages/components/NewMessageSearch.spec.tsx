import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { NewMessageSearch } from './NewMessageSearch';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSearchProviderSuggestions } from '../../../hooks/search/useSearchProviderSuggestions';
import { getMessagesUrl } from '../urls';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../hooks/search/useSearchProviderSuggestions', () => ({
  useSearchProviderSuggestions: jest.fn(),
}));

const push = jest.fn();
const onClose = jest.fn();

const renderSearch = (
  hits: { id: string; title: string; subtitle: string }[] = [],
) => {
  jest.mocked(useSearchProviderSuggestions).mockReturnValue({
    suggestions: { hits },
    isLoading: false,
  } as unknown as ReturnType<typeof useSearchProviderSuggestions>);

  return render(
    <QueryClientProvider client={new QueryClient()}>
      <NewMessageSearch onClose={onClose} />
    </QueryClientProvider>,
  );
};

const type = (value: string) =>
  fireEvent.input(screen.getByRole('textbox'), { target: { value } });

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({
    push,
  } as unknown as ReturnType<typeof useRouter>);
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'me' },
  } as unknown as ReturnType<typeof useAuthContext>);
});

describe('NewMessageSearch', () => {
  it('asks for more input before searching', () => {
    renderSearch();

    expect(screen.getByText('Search by name or username.')).toBeInTheDocument();
    expect(jest.mocked(useSearchProviderSuggestions)).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('lists matching developers but never the viewer', () => {
    renderSearch([
      { id: 'me', title: 'Me', subtitle: 'me' },
      { id: 'ada', title: 'Ada Lovelace', subtitle: 'ada' },
    ]);
    type('ad');

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText('Me')).not.toBeInTheDocument();
  });

  it('opens the chat with the picked developer', () => {
    renderSearch([{ id: 'ada', title: 'Ada Lovelace', subtitle: 'ada' }]);
    type('ad');

    fireEvent.click(screen.getByText('Ada Lovelace'));

    expect(push).toHaveBeenCalledWith(getMessagesUrl('ada'));
    expect(onClose).toHaveBeenCalled();
  });

  it('opens the first result on enter and closes on escape', () => {
    renderSearch([
      { id: 'ada', title: 'Ada Lovelace', subtitle: 'ada' },
      { id: 'grace', title: 'Grace Hopper', subtitle: 'grace' },
    ]);
    type('ad');

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(push).toHaveBeenCalledWith(getMessagesUrl('ada'));

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
