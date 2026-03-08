import React from 'react';
import { act, render } from '@testing-library/react';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import { ProfileTooltip } from './ProfileTooltip';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

const mockSetQueryData = jest.fn();
const mockLogEvent = jest.fn();
const mockSimpleTooltipSpy = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query',
  ),
  useQueryClient: () => ({ setQueryData: mockSetQueryData }),
  useQuery: () => ({ data: null, isLoading: false }),
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
});
