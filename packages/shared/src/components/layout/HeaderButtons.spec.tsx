import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { HeaderButtons } from './HeaderButtons';

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

const renderComponent = (optOutQuestSystem = false) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ optOutQuestSystem }}
    >
      <HeaderButtons />
    </TestBootProvider>,
  );

describe('HeaderButtons', () => {
  it('should render the quest entry when quests are enabled', () => {
    renderComponent(false);

    expect(screen.getByText('Quest button')).toBeInTheDocument();
  });

  it('should hide the quest entry when quests are disabled', () => {
    renderComponent(true);

    expect(screen.queryByText('Quest button')).not.toBeInTheDocument();
  });
});
