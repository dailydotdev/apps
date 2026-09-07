import React from 'react';
import { render, screen } from '@testing-library/react';
import { SidebarEntityIcon } from './SidebarEntityIcon';

const mockSourceImageQueryOptions = jest.fn().mockReturnValue({
  queryKey: ['source-image'],
  queryFn: () => null,
  enabled: false,
});

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined }),
}));

jest.mock('../../graphql/sources', () => ({
  sourceImageQueryOptions: (props: { handle: string; enabled: boolean }) =>
    mockSourceImageQueryOptions(props),
}));

jest.mock('../../contexts/AuthContext', () => ({
  __esModule: true,
  useAuthContext: () => ({ isFetched: true }),
}));

jest.mock('../icons', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const react = require('react');
  const icon = (name: string) => (): unknown =>
    react.createElement('span', { 'data-testid': `icon-${name}` });
  return {
    __esModule: true,
    BellIcon: icon('bell'),
    BookmarkIcon: icon('bookmark'),
    CompassIcon: icon('compass'),
    EarthIcon: icon('earth'),
    HashtagIcon: icon('hashtag'),
    HotIcon: icon('hot'),
    JobIcon: icon('job'),
    LinkIcon: icon('link'),
    SettingsIcon: icon('settings'),
    SourceIcon: icon('source'),
    SquadIcon: icon('squad'),
    TimerIcon: icon('timer'),
  };
});

describe('SidebarEntityIcon', () => {
  beforeEach(() => {
    mockSourceImageQueryOptions.mockClear();
  });

  // Each of these is a panel row that can be dragged into the shortcuts dock;
  // the pinned shortcut has to keep the glyph the row showed in the panel.
  it.each([
    ['https://app.daily.dev/squads/moderate', 'icon-timer'],
    ['https://app.daily.dev/squads/discover', 'icon-source'],
    ['https://app.daily.dev/squads/discover/my', 'icon-source'],
    ['/posts', 'icon-compass'],
    ['https://app.daily.dev/jobs', 'icon-job'],
    ['https://app.daily.dev/notifications', 'icon-bell'],
    ['https://app.daily.dev/game-center', 'icon-hot'],
    ['https://app.daily.dev/settings/notifications', 'icon-settings'],
    ['https://app.daily.dev/bookmarks/some-folder-id', 'icon-bookmark'],
    ['https://app.daily.dev/feeds/some-feed-id', 'icon-hashtag'],
    ['https://app.daily.dev/sources/react', 'icon-earth'],
    ['https://app.daily.dev/tags/webdev', 'icon-hashtag'],
    ['https://app.daily.dev/squads/my-squad', 'icon-squad'],
    ['https://app.daily.dev/something-else', 'icon-link'],
  ])('renders the right glyph for %s', (path, testId) => {
    render(<SidebarEntityIcon path={path} />);

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('only looks up a squad image for an actual handle', () => {
    render(<SidebarEntityIcon path="https://app.daily.dev/squads/moderate" />);

    expect(mockSourceImageQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ handle: '' }),
    );
  });

  it('reads a squad handle from the segment after /squads/', () => {
    render(
      <SidebarEntityIcon path="https://app.daily.dev/squads/my-squad/members" />,
    );

    expect(mockSourceImageQueryOptions).toHaveBeenCalledWith(
      expect.objectContaining({ handle: 'my-squad' }),
    );
  });
});
