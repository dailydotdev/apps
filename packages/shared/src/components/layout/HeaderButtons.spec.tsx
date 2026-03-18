import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { GrowthBook } from '@growthbook/growthbook';
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

const getGrowthBook = (isQuestsFeatureEnabled = true): GrowthBook => {
  const gb = new GrowthBook();

  gb.setFeatures({
    quests: {
      defaultValue: isQuestsFeatureEnabled,
    },
  });

  return gb;
};

const renderComponent = ({
  optOutQuestSystem = false,
  isQuestsFeatureEnabled = true,
}: {
  optOutQuestSystem?: boolean;
  isQuestsFeatureEnabled?: boolean;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      settings={{ optOutQuestSystem }}
      gb={getGrowthBook(isQuestsFeatureEnabled)}
    >
      <HeaderButtons />
    </TestBootProvider>,
  );

describe('HeaderButtons', () => {
  it('should render the quest entry when quest experiment is enabled', () => {
    renderComponent({ optOutQuestSystem: false, isQuestsFeatureEnabled: true });

    expect(screen.getByText('Quest button')).toBeInTheDocument();
  });

  it('should hide the quest entry when opted out from quests', () => {
    renderComponent({ optOutQuestSystem: true, isQuestsFeatureEnabled: true });

    expect(screen.queryByText('Quest button')).not.toBeInTheDocument();
  });

  it('should hide the quest entry when quest experiment is disabled', () => {
    renderComponent({
      optOutQuestSystem: false,
      isQuestsFeatureEnabled: false,
    });

    expect(screen.queryByText('Quest button')).not.toBeInTheDocument();
  });
});
