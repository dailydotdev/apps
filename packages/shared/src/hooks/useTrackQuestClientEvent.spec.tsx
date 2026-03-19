import { renderHook, waitFor } from '@testing-library/react';
import { useAuthContext } from '../contexts/AuthContext';
import { ClientQuestEventType, trackQuestClientEvent } from '../graphql/quests';
import { useTrackQuestClientEvent } from './useTrackQuestClientEvent';

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../graphql/quests', () => ({
  ...jest.requireActual('../graphql/quests'),
  trackQuestClientEvent: jest.fn(),
}));

type HookProps = {
  eventType: ClientQuestEventType;
  enabled?: boolean;
  eventKey?: string;
};

const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockTrackQuestClientEvent = trackQuestClientEvent as jest.MockedFunction<
  typeof trackQuestClientEvent
>;

const renderTrackQuestHook = (props: HookProps) =>
  renderHook((hookProps: HookProps) => useTrackQuestClientEvent(hookProps), {
    initialProps: props,
  });

describe('useTrackQuestClientEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      user: { id: 'test-user-id' },
    } as ReturnType<typeof useAuthContext>);
    mockTrackQuestClientEvent.mockResolvedValue(undefined);
  });

  it('should track a client quest event only once for the same event key', async () => {
    const { rerender } = renderTrackQuestHook({
      eventType: ClientQuestEventType.VisitArena,
    });

    await waitFor(() => {
      expect(mockTrackQuestClientEvent).toHaveBeenCalledTimes(1);
    });

    rerender({
      eventType: ClientQuestEventType.VisitArena,
    });

    expect(mockTrackQuestClientEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackQuestClientEvent).toHaveBeenCalledWith(
      ClientQuestEventType.VisitArena,
    );
  });

  it('should track again when the event key changes', async () => {
    const { rerender } = renderTrackQuestHook({
      eventType: ClientQuestEventType.ViewUserProfile,
      eventKey: 'profile:user-1',
    });

    await waitFor(() => {
      expect(mockTrackQuestClientEvent).toHaveBeenCalledTimes(1);
    });

    rerender({
      eventType: ClientQuestEventType.ViewUserProfile,
      eventKey: 'profile:user-2',
    });

    await waitFor(() => {
      expect(mockTrackQuestClientEvent).toHaveBeenCalledTimes(2);
    });
  });

  it('should not track when the user is logged out', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
    } as ReturnType<typeof useAuthContext>);

    renderTrackQuestHook({
      eventType: ClientQuestEventType.VisitExplorePage,
    });

    expect(mockTrackQuestClientEvent).not.toHaveBeenCalled();
  });

  it('should retry after a failed request when re-enabled', async () => {
    mockTrackQuestClientEvent
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(undefined);

    const { rerender } = renderTrackQuestHook({
      eventType: ClientQuestEventType.VisitDiscussionsPage,
      eventKey: 'discussions',
    });

    await waitFor(() => {
      expect(mockTrackQuestClientEvent).toHaveBeenCalledTimes(1);
    });

    rerender({
      eventType: ClientQuestEventType.VisitDiscussionsPage,
      eventKey: 'discussions',
      enabled: false,
    });

    rerender({
      eventType: ClientQuestEventType.VisitDiscussionsPage,
      eventKey: 'discussions',
      enabled: true,
    });

    await waitFor(() => {
      expect(mockTrackQuestClientEvent).toHaveBeenCalledTimes(2);
    });
  });
});
