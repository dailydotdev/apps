import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { SourceActions } from './index';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Source } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import { useSourceActions } from '../../../hooks';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../hooks/source/useSourceActions', () => ({
  __esModule: true,
  useSourceActions: jest.fn(),
  default: jest.fn(),
}));

jest.mock('../../../hooks/contentPreference/useContentPreference', () => ({
  useContentPreference: jest.fn(),
}));

const useSourceActionsMock = useSourceActions as jest.Mock;
const useContentPreferenceMock = useContentPreference as jest.Mock;

const source: Source = {
  id: 'tds',
  name: 'Towards Data Science',
  handle: 'tds',
  permalink: 'https://app.daily.dev/sources/tds',
  image: 'https://media.daily.dev/tds',
  type: SourceType.Machine,
  public: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  useSourceActionsMock.mockReturnValue({
    isBlocked: false,
    toggleBlock: jest.fn(),
    isFollowing: false,
    toggleFollow: jest.fn(),
    haveNotificationsOn: false,
    toggleNotify: jest.fn(),
  });
  useContentPreferenceMock.mockReturnValue({
    follow: jest.fn(),
    unfollow: jest.fn(),
  });
});

const renderComponent = ({
  showShare = true,
  isFollowing = false,
  isBlocked = false,
} = {}): RenderResult => {
  useSourceActionsMock.mockReturnValue({
    isBlocked,
    toggleBlock: jest.fn(),
    isFollowing,
    toggleFollow: jest.fn(),
    haveNotificationsOn: false,
    toggleNotify: jest.fn(),
  });

  return render(
    <TestBootProvider client={new QueryClient()}>
      <SourceActions source={source} {...(showShare && { showShare: true })} />
    </TestBootProvider>,
  );
};

// Radix's trigger opens on pointerdown/keydown, not click; keyboard also covers
// the a11y requirement for the menu.
const openOptionsMenu = () =>
  fireEvent.keyDown(screen.getByLabelText('Options'), { key: 'Enter' });

describe('SourceActions header treatment', () => {
  it('surfaces the copy control next to Follow', async () => {
    renderComponent();

    expect(await screen.findByLabelText('Copy link')).toBeInTheDocument();
    expect(screen.getAllByText('Follow').length).toBeGreaterThan(0);
  });

  it('keeps the control next to Following, alongside the bell', async () => {
    renderComponent({ isFollowing: true });

    expect(await screen.findByLabelText('Copy link')).toBeInTheDocument();
    expect(screen.getAllByText('Following').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
  });

  it('drops the in-menu share entry and moves Block into the menu', async () => {
    renderComponent();

    expect(screen.queryByTestId('blockButton')).not.toBeInTheDocument();

    openOptionsMenu();

    expect(await screen.findByText('Add to custom feed')).toBeInTheDocument();
    expect(screen.getByText('Block')).toBeInTheDocument();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('keeps Unblock in the row while blocked, and out of the menu', async () => {
    renderComponent({ isBlocked: true });

    expect(await screen.findByLabelText('Unblock')).toBeInTheDocument();

    openOptionsMenu();

    expect(await screen.findByText('Add to custom feed')).toBeInTheDocument();
    expect(screen.queryByText('Block')).not.toBeInTheDocument();
  });

  it('leaves embedded consumers on the original row', async () => {
    renderComponent({ showShare: false });

    expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
    expect(screen.getByTestId('blockButton')).toBeInTheDocument();

    openOptionsMenu();

    expect(await screen.findByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Add to custom feed')).toBeInTheDocument();
    // Block stays the row button it has always been, not a menu entry.
    expect(screen.getAllByText('Block')).toHaveLength(1);
  });
});
