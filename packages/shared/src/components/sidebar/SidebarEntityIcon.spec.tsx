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

// Every icon compiles to the same bare <svg> under the svgr mock, so stand them
// up as identifiable stubs — the mapping from path to icon is what's under test.
const iconStub = (name: string) => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const react = require('react');
  return ({ secondary }: { secondary?: boolean }) =>
    react.createElement('span', {
      'data-testid': `icon-${name}`,
      'data-secondary': String(!!secondary),
    });
};

jest.mock('../icons', () => ({
  __esModule: true,
  AnalyticsIcon: iconStub('Analytics'),
  BellIcon: iconStub('Bell'),
  BookmarkIcon: iconStub('Bookmark'),
  BriefIcon: iconStub('Brief'),
  CompassIcon: iconStub('Compass'),
  EarthIcon: iconStub('Earth'),
  HashtagIcon: iconStub('Hashtag'),
  HomeIcon: iconStub('Home'),
  HotIcon: iconStub('Hot'),
  JobIcon: iconStub('Job'),
  LinkIcon: iconStub('Link'),
  SettingsIcon: iconStub('Settings'),
  SourceIcon: iconStub('Source'),
  SquadIcon: iconStub('Squad'),
  TimerIcon: iconStub('Timer'),
}));

jest.mock('../icons/Bookmark/Reminder', () => ({
  __esModule: true,
  BookmarkReminderIcon: iconStub('BookmarkReminder'),
}));

jest.mock('../icons/Folder', () => ({
  __esModule: true,
  FolderIcon: iconStub('Folder'),
}));

describe('SidebarEntityIcon', () => {
  beforeEach(() => {
    mockSourceImageQueryOptions.mockClear();
  });

  // Each of these is a sidebar row that can be dragged into the shortcuts dock;
  // the pinned shortcut has to keep the glyph the row showed in the panel.
  it.each([
    ['https://app.daily.dev/squads/moderate', 'Timer'],
    ['https://app.daily.dev/squads/discover', 'Source'],
    ['https://app.daily.dev/squads/discover/my', 'Source'],
    ['/posts', 'Compass'],
    ['https://app.daily.dev/jobs', 'Job'],
    ['https://app.daily.dev/notifications', 'Bell'],
    ['https://app.daily.dev/game-center', 'Hot'],
    ['https://app.daily.dev/settings/notifications', 'Settings'],
    ['https://app.daily.dev/bookmarks', 'Bookmark'],
    ['https://app.daily.dev/bookmarks/later', 'BookmarkReminder'],
    ['https://app.daily.dev/bookmarks/some-folder-id', 'Folder'],
    ['https://app.daily.dev/feeds/some-feed-id', 'Hashtag'],
    ['https://app.daily.dev/sources/react', 'Earth'],
    ['https://app.daily.dev/tags/webdev', 'Hashtag'],
    ['https://app.daily.dev/squads/my-squad', 'Squad'],
    ['https://app.daily.dev/something-else', 'Link'],
  ])('renders the right glyph for %s', (path, icon) => {
    render(<SidebarEntityIcon path={path} />);

    expect(screen.getByTestId(`icon-${icon}`)).toBeInTheDocument();
  });

  it('fills the glyph when the shortcut is the current page', () => {
    render(<SidebarEntityIcon path="/posts" active />);

    expect(screen.getByTestId('icon-Compass')).toHaveAttribute(
      'data-secondary',
      'true',
    );
  });

  it('leaves the glyph outlined when it is not the current page', () => {
    render(<SidebarEntityIcon path="/posts" />);

    expect(screen.getByTestId('icon-Compass')).toHaveAttribute(
      'data-secondary',
      'false',
    );
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
