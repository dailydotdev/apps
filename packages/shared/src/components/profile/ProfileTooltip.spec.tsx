import React from 'react';
import { act, render } from '@testing-library/react';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import { ProfileTooltip } from './ProfileTooltip';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import type { UserShortProfile } from '../../lib/user';

const mockSetQueryData = jest.fn();
const mockLogEvent = jest.fn();
const mockSimpleTooltipSpy = jest.fn();
const mockUseQuery = jest.fn<
  { data: null; isLoading: boolean },
  [options: unknown]
>(() => ({ data: null, isLoading: false }));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ setQueryData: mockSetQueryData }),
  useQuery: (options: unknown) => mockUseQuery(options),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

jest.mock('../tooltips/SimpleTooltip', () => ({
  SimpleTooltip: ({ children, ...props }: TooltipProps) => {
    mockSimpleTooltipSpy(props);
    return <div>{children}</div>;
  },
}));

describe('ProfileTooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: null, isLoading: false });
    (useLogContext as jest.Mock).mockReturnValue({ logEvent: mockLogEvent });
  });

  it('should log hover user card event on show', () => {
    render(
      <ProfileTooltip userId="user-1">
        <button type="button">User</button>
      </ProfileTooltip>,
    );

    const [props] = mockSimpleTooltipSpy.mock.calls[0] as [TooltipProps];
    const { onShow } = props;

    act(() => {
      onShow?.({} as never);
    });

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.HoverUserCard,
      target_id: 'user-1',
    });
  });

  it('should call custom tooltip onShow callback', () => {
    const tooltipOnShow = jest.fn();

    render(
      <ProfileTooltip userId="user-2" tooltip={{ onShow: tooltipOnShow }}>
        <button type="button">User</button>
      </ProfileTooltip>,
    );

    const [props] = mockSimpleTooltipSpy.mock.calls[0] as [TooltipProps];
    const { onShow } = props;
    const instance = {} as never;

    act(() => {
      onShow?.(instance);
    });

    expect(tooltipOnShow).toHaveBeenCalledWith(instance);
  });

  it('uses an initial user without enabling the profile fetch', () => {
    const initialUser: UserShortProfile = {
      id: 'user-3',
      name: 'User Three',
      username: 'user-three',
      image: '',
      createdAt: '2026-05-13T00:00:00.000Z',
      reputation: 0,
      permalink: '/user-three',
    };

    render(
      <ProfileTooltip userId={initialUser.id} initialUser={initialUser}>
        <button type="button">User</button>
      </ProfileTooltip>,
    );

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
    const [props] = mockSimpleTooltipSpy.mock.calls[0] as [TooltipProps];
    expect(props.content).toBeTruthy();
  });

  it('only triggers on mouseenter ( not keyboard focus ) for WCAG 3.2.1', () => {
    render(
      <ProfileTooltip userId="user-1">
        <button type="button">User</button>
      </ProfileTooltip>,
    );
    const [props] = mockSimpleTooltipSpy.mock.calls[0] as [TooltipProps];
    expect(props.trigger).toBe('mouseenter');
  });
});
