import { act, renderHook } from '@testing-library/react';

const mockSetDismissed = jest.fn();
let mockPersistentState: [string[], jest.Mock, boolean] = [
  [],
  mockSetDismissed,
  true,
];

jest.mock('./usePersistentState', () => ({
  usePersistentState: () => mockPersistentState,
}));

jest.mock('../components/announcements/content', () => ({
  SIDEBAR_ANNOUNCEMENTS: [
    { id: 'a', variant: 'default', title: 'A' },
    { id: 'b', variant: 'default', title: 'B' },
  ],
}));

// eslint-disable-next-line import/first
import { useSidebarAnnouncements } from './useSidebarAnnouncements';

describe('useSidebarAnnouncements', () => {
  beforeEach(() => {
    mockSetDismissed.mockReset();
    mockPersistentState = [[], mockSetDismissed, true];
  });

  it('returns no items until the dismissed list has hydrated', () => {
    mockPersistentState = [[], mockSetDismissed, false];
    const { result } = renderHook(() => useSidebarAnnouncements());

    expect(result.current.isReady).toBe(false);
    expect(result.current.items).toHaveLength(0);
  });

  it('returns all announcements once loaded', () => {
    const { result } = renderHook(() => useSidebarAnnouncements());

    expect(result.current.isReady).toBe(true);
    expect(result.current.items.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('filters out dismissed announcements', () => {
    mockPersistentState = [['a'], mockSetDismissed, true];
    const { result } = renderHook(() => useSidebarAnnouncements());

    expect(result.current.items.map((item) => item.id)).toEqual(['b']);
  });

  it('persists a newly dismissed id', () => {
    const { result } = renderHook(() => useSidebarAnnouncements());

    act(() => result.current.dismiss('a'));

    expect(mockSetDismissed).toHaveBeenCalledWith(['a']);
  });

  it('ignores dismissing an already dismissed id', () => {
    mockPersistentState = [['a'], mockSetDismissed, true];
    const { result } = renderHook(() => useSidebarAnnouncements());

    act(() => result.current.dismiss('a'));

    expect(mockSetDismissed).not.toHaveBeenCalled();
  });
});
