import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { MessagesScreen } from './MessagesScreen';
import { useLfgEnabled } from '../../lfg/hooks/useLfgEnabled';

jest.mock('../../lfg/hooks/useLfgEnabled', () => ({
  useLfgEnabled: jest.fn(() => ({ isEnabled: true })),
}));
jest.mock('../hooks/useMessagesLiveUpdates', () => ({
  useMessagesLiveUpdates: jest.fn(),
}));
jest.mock('../hooks/useDmSettings', () => ({
  useDmSettings: () => ({ allowsMessages: true }),
}));
jest.mock('../../lfg/components/messages/LfgRequestSection', () => ({
  useLfgRequestCount: () => 0,
}));
jest.mock('./ConversationList', () => ({
  ConversationList: () => <div>conversation list</div>,
}));
jest.mock('./RequestList', () => ({
  RequestList: () => <div>request list</div>,
}));
jest.mock('../../lfg/components/messages/LfgMessagesTab', () => ({
  LfgMessagesTab: () => <div>lfg tab</div>,
}));
jest.mock('../../lfg/components/messages/LfgMessagesPromo', () => ({
  LfgMessagesPromo: () => null,
}));

const renderScreen = (props: Parameters<typeof MessagesScreen>[0] = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, isLoggedIn: true }}
    >
      <MessagesScreen {...props} />
    </TestBootProvider>,
  );

// The phone row is the first Inbox nav; tablet up has its own buttons.
const phoneSegments = () =>
  within(screen.getAllByRole('navigation', { name: 'Inbox' })[0]);

describe('MessagesScreen phone inbox segments', () => {
  it('lists an LFG segment and selects it on the LFG tab', () => {
    renderScreen({ showLfg: true });

    expect(screen.getByText('lfg tab')).toBeInTheDocument();
    expect(phoneSegments().getByText('LFG').closest('a')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(phoneSegments().getByText('Chats').closest('a')).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('has no LFG segment without the lfg flag', () => {
    jest.mocked(useLfgEnabled).mockReturnValue({ isEnabled: false } as never);
    renderScreen({ showLfg: true });

    expect(phoneSegments().queryByText('LFG')).not.toBeInTheDocument();
    expect(screen.getByText('conversation list')).toBeInTheDocument();
  });
});
