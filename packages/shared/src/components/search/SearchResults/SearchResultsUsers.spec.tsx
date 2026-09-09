import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Origin, TargetType } from '../../../lib/log';
import { SearchProviderEnum } from '../../../graphql/search';
import { SearchResultsUsers } from './SearchResultsUsers';

const mockLogEvent = jest.fn();

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../widgets/WidgetCard', () => ({
  WidgetCard: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('../../widgets/PostUsersHighlights', () => ({
  UserHighlight: ({ name }: { name: string }) => <span>{name}</span>,
}));

jest.mock('../../widgets/ListItemPlaceholder', () => ({
  ListItemPlaceholder: () => null,
}));

jest.mock('../../contentPreference/FollowButton', () => ({
  FollowButton: () => null,
}));

const items = [
  { id: 'u1', title: 'Ada', subtitle: 'ada' },
  { id: 'u2', title: 'Linus', subtitle: 'linus' },
];

describe('SearchResultsUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs the query identity and row position on a click', async () => {
    render(
      <SearchResultsUsers
        items={items}
        isLoading={false}
        searchId="search-1"
        searchVersion={4}
      />,
    );

    await userEvent.click(screen.getByText('Linus'));

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent.mock.calls[0][0]).toMatchObject({
      target_type: TargetType.SearchRecommendation,
      target_id: 'u2',
    });
    expect(JSON.parse(mockLogEvent.mock.calls[0][0].extra)).toEqual({
      origin: Origin.SearchPage,
      provider: SearchProviderEnum.Users,
      position: 1,
      search_id: 'search-1',
      search_version: 4,
    });
  });
});
