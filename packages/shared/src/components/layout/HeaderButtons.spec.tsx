import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { HeaderButtons } from './HeaderButtons';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { plusUrl } from '../../lib/constants';

jest.mock('../LoginButton', () => ({
  __esModule: true,
  default: function LoginButtonMock(): ReactElement {
    return <div>Login button</div>;
  },
}));

jest.mock('../notifications/NotificationsBell', () => ({
  __esModule: true,
  default: function NotificationsBellMock(): ReactElement {
    return <div>Notifications bell</div>;
  },
}));

jest.mock('../profile/ProfileButton', () => ({
  __esModule: true,
  default: function ProfileButtonMock(): ReactElement {
    return <div>Profile button</div>;
  },
}));

jest.mock('../opportunity/OpportunityEntryButton', () => ({
  OpportunityEntryButton: (): ReactElement => <div>Opportunity entry</div>,
}));
jest.mock('../quest/QuestButton', () => ({
  QuestButton: (): ReactElement => <div>Quest button</div>,
}));

const renderComponent = ({
  optOutQuestSystem = false,
  isPlus = false,
}: {
  optOutQuestSystem?: boolean;
  isPlus?: boolean;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ optOutQuestSystem }}
      auth={{ user: { ...loggedUser, isPlus } }}
    >
      <HeaderButtons />
    </TestBootProvider>,
  );

describe('HeaderButtons', () => {
  it('should render the quest entry for logged-in users', () => {
    renderComponent({ optOutQuestSystem: false });

    expect(screen.getByText('Quest button')).toBeInTheDocument();
  });

  it('should hide the quest entry when opted out from quests', () => {
    renderComponent({ optOutQuestSystem: true });

    expect(screen.queryByText('Quest button')).not.toBeInTheDocument();
  });

  it('should link free readers to Plus from the header', () => {
    renderComponent();

    expect(screen.getByRole('link', { name: 'Get Plus' })).toHaveAttribute(
      'href',
      plusUrl,
    );
  });

  it('should hide the Plus button for Plus members', () => {
    renderComponent({ isPlus: true });

    expect(
      screen.queryByRole('link', { name: 'Get Plus' }),
    ).not.toBeInTheDocument();
  });
});
