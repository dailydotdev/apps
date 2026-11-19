import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { QueryStateKeys } from '../../hooks/utils/useQueryState';
import { LogEvent, Origin, TargetId } from '../../lib/log';
import { useSetFeedExplain } from './useSetFeedExplain';

const logEvent = jest.fn();

const renderSetter = (origin: Origin, isOn = false) => {
  const client = new QueryClient();
  client.setQueryData([QueryStateKeys.FeedExplain], isOn);
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider
      client={client}
      auth={{ user: defaultUser }}
      log={{ logEvent }}
    >
      {children}
    </TestBootProvider>
  );
  const { result } = renderHook(() => useSetFeedExplain(origin), { wrapper });

  return { client, result };
};

beforeEach(() => {
  logEvent.mockClear();
});

describe('useSetFeedExplain', () => {
  it.each([
    [false, TargetId.On],
    [true, TargetId.Off],
  ])(
    'should log the new state and where from (on before: %s)',
    (isOn, targetId) => {
      const { client, result } = renderSetter(Origin.FeedExplain, isOn);

      act(() => result.current(!isOn));

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ToggleFeedExplain,
        target_id: targetId,
        extra: JSON.stringify({ origin: Origin.FeedExplain }),
      });
      expect(client.getQueryData([QueryStateKeys.FeedExplain])).toBe(!isOn);
    },
  );

  it('should log nothing when Debug is already on, as when Tune opens', () => {
    const { result } = renderSetter(Origin.Settings, true);

    act(() => result.current(true));

    expect(logEvent).not.toHaveBeenCalled();
  });
});
