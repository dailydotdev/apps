import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useQueryTab } from './useQueryTab';
import { useIsPhone } from '../../hooks/useViewSize';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useIsPhone: jest.fn(),
}));

const tabs = ['Sources', 'Squads', 'Users'] as const;
const replace = jest.fn();

const mockRouter = (asPath: string, query: Record<string, string>) =>
  jest.mocked(useRouter).mockReturnValue({
    asPath,
    query,
    replace,
  } as unknown as ReturnType<typeof useRouter>);

describe('useQueryTab', () => {
  beforeEach(() => {
    replace.mockClear();
    jest.mocked(useIsPhone).mockReturnValue(true);
  });

  it('opens the tab its address names on a phone', () => {
    mockRouter('/settings/feed/sources?tab=squads', { tab: 'squads' });
    const { result } = renderHook(() => useQueryTab(tabs));

    expect(result.current.activeTab).toBe('Squads');
    expect(result.current.segments.find((segment) => segment.active)?.key).toBe(
      'Squads',
    );
  });

  it('replaces the address with the tab, keeping the rest of the query', () => {
    mockRouter('/feeds/abc/edit?dview=sources', { dview: 'sources' });
    const { result } = renderHook(() => useQueryTab(tabs));

    act(() => result.current.setActiveTab('Users'));

    expect(replace).toHaveBeenCalledWith(
      '/feeds/abc/edit?dview=sources&tab=users',
      undefined,
      { shallow: true, scroll: false },
    );
  });

  it('gives the first tab the bare address', () => {
    mockRouter('/settings/feed/sources?tab=users', { tab: 'users' });
    const { result } = renderHook(() => useQueryTab(tabs));

    act(() => result.current.setActiveTab('Sources'));

    expect(replace).toHaveBeenCalledWith(
      '/settings/feed/sources',
      undefined,
      expect.anything(),
    );
  });

  it('keeps the tab in state on wider screens and where it is not addressed', () => {
    jest.mocked(useIsPhone).mockReturnValue(false);
    mockRouter('/settings/feed/sources?tab=users', { tab: 'users' });
    const { result } = renderHook(() => useQueryTab(tabs));

    expect(result.current.activeTab).toBe('Sources');
    act(() => result.current.setActiveTab('Squads'));

    expect(result.current.activeTab).toBe('Squads');
    expect(replace).not.toHaveBeenCalled();

    jest.mocked(useIsPhone).mockReturnValue(true);
    const { result: unaddressed } = renderHook(() =>
      useQueryTab(tabs, { isAddressed: false }),
    );
    act(() => unaddressed.current.setActiveTab('Users'));

    expect(unaddressed.current.activeTab).toBe('Users');
    expect(replace).not.toHaveBeenCalled();
  });
});
