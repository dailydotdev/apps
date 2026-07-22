import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
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

const getGrowthBook = (isEnabled: boolean): GrowthBook => {
  const gb = new GrowthBook();
  gb.setFeatures({
    sharing_visibility: { defaultValue: isEnabled },
    share_tags_sources: { defaultValue: isEnabled },
  });

  return gb;
};

const renderComponent = (
  { isEnabled = false, showShare = true } = {},
  isFollowing = false,
): RenderResult => {
  useSourceActionsMock.mockReturnValue({
    isBlocked: false,
    toggleBlock: jest.fn(),
    isFollowing,
    toggleFollow: jest.fn(),
    haveNotificationsOn: false,
    toggleNotify: jest.fn(),
  });

  return render(
    <TestBootProvider client={new QueryClient()} gb={getGrowthBook(isEnabled)}>
      <SourceActions source={source} {...(showShare && { showShare: true })} />
    </TestBootProvider>,
  );
};

describe('SourceActions share control', () => {
  it('surfaces share next to Follow when the flag is on', async () => {
    renderComponent({ isEnabled: true });

    expect(await screen.findByLabelText('Share')).toBeInTheDocument();
    expect(screen.getAllByText('Follow').length).toBeGreaterThan(0);
  });

  it('keeps the control next to Following once the source is followed', async () => {
    renderComponent({ isEnabled: true }, true);

    expect(await screen.findByLabelText('Share')).toBeInTheDocument();
    expect(screen.getAllByText('Following').length).toBeGreaterThan(0);
  });

  it('drops the in-menu share entry when the visible control is shown', async () => {
    renderComponent({ isEnabled: true });

    // Radix's trigger opens on pointerdown/keydown, not click; keyboard also
    // covers the a11y requirement for the menu.
    fireEvent.keyDown(screen.getByLabelText('Options'), { key: 'Enter' });

    expect(await screen.findByText('Add to custom feed')).toBeInTheDocument();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('keeps share inside the options menu when the flag is off', async () => {
    renderComponent({ isEnabled: false });

    expect(screen.queryByLabelText('Share')).not.toBeInTheDocument();

    // Radix's trigger opens on pointerdown/keydown, not click; keyboard also
    // covers the a11y requirement for the menu.
    fireEvent.keyDown(screen.getByLabelText('Options'), { key: 'Enter' });

    expect(await screen.findByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Add to custom feed')).toBeInTheDocument();
  });

  it('renders identical markup to the untouched consumer when the flag is off', async () => {
    // Radix mints an incrementing id per mount; it carries no behaviour.
    const normalize = (html: string) =>
      html.replace(/radix-:r[^:]*:/g, 'radix');

    const { container: optedIn, unmount } = renderComponent({
      isEnabled: false,
      showShare: true,
    });
    const optedInHtml = normalize(optedIn.innerHTML);
    unmount();

    const { container: untouched } = renderComponent({
      isEnabled: false,
      showShare: false,
    });

    await waitFor(() =>
      expect(normalize(untouched.innerHTML)).toEqual(optedInHtml),
    );
  });
});
