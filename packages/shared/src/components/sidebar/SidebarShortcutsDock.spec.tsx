import { renderHook } from '@testing-library/react';
import { useSidebarShortcutItems } from './SidebarShortcutsDock';
import { webappUrl } from '../../lib/constants';

const mockSetStored = jest.fn().mockResolvedValue(undefined);
let mockStored: unknown[] = [];

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  default: () => [mockStored, mockSetStored, true, false],
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

describe('useSidebarShortcutItems stored entry handling', () => {
  beforeEach(() => {
    mockStored = [];
    mockSetStored.mockClear();
  });

  it('keeps a shortcut whose catalog entry this layout retired', () => {
    mockStored = ['explore'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    // Without the migration the id fails the catalog check and the pin is
    // dropped — then written away for good on the next mutation.
    expect(result.current.resolved).toHaveLength(1);
    expect(result.current.resolved[0]).toMatchObject({
      label: 'Explore',
      path: `${webappUrl}posts`,
    });
  });

  it('migrates the retired id to a pinned page so the next persist keeps it', () => {
    mockStored = ['jobs'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.items).toEqual([
      { title: 'Jobs', path: `${webappUrl}jobs` },
    ]);
  });

  it('still drops an id that was never a catalog entry', () => {
    mockStored = ['not-a-real-shortcut'];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.resolved).toHaveLength(0);
  });

  it('de-duplicates a retired id against the same page pinned directly', () => {
    mockStored = ['explore', { title: 'Explore', path: `${webappUrl}posts` }];
    const { result } = renderHook(() => useSidebarShortcutItems());

    expect(result.current.resolved).toHaveLength(1);
  });
});
