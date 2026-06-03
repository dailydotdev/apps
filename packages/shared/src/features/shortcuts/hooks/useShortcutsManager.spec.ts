import { act, renderHook, waitFor } from '@testing-library/react';
import { useShortcutsManager } from './useShortcutsManager';

type ToastOptions = {
  timer?: number;
  action?: {
    copy?: string;
    onClick: () => void | Promise<void>;
  };
};

// Jest hoists `jest.mock` factories above imports, so any identifiers they
// reference must be prefixed with `mock` per jest's out-of-scope guard.
const mockState = {
  customLinks: [] as string[],
  flags: { shortcutMeta: {} as Record<string, unknown> } as Record<
    string,
    unknown
  >,
};
const mockSetSettings = jest.fn(async (patch: Record<string, unknown>) => {
  if ('customLinks' in patch) {
    mockState.customLinks = patch.customLinks as string[];
  }
  if ('flags' in patch) {
    mockState.flags = { ...(patch.flags as Record<string, unknown>) };
  }
});
const mockUpdateCustomLinks = jest.fn(async (links: string[]) => {
  mockState.customLinks = [...links];
});
const mockLogEvent = jest.fn();
const mockDisplayToast = jest.fn<void, [string, ToastOptions?]>();

jest.mock('../../../contexts/SettingsContext', () => ({
  useSettingsContext: () => ({
    get customLinks() {
      return mockState.customLinks;
    },
    get flags() {
      return mockState.flags;
    },
    updateCustomLinks: mockUpdateCustomLinks,
    setSettings: mockSetSettings,
  }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../contexts/ShortcutsProvider', () => ({
  useShortcuts: () => ({ setShowImportSource: jest.fn() }),
}));

const resetState = () => {
  mockState.customLinks = [];
  mockState.flags = { shortcutMeta: {} };
  mockSetSettings.mockClear();
  mockUpdateCustomLinks.mockClear();
  mockLogEvent.mockClear();
  mockDisplayToast.mockClear();
};

describe('useShortcutsManager', () => {
  beforeEach(resetState);

  it('adds a shortcut with https normalization', async () => {
    const { result } = renderHook(() => useShortcutsManager());

    await act(async () => {
      const res = await result.current.addShortcut({ url: 'example.com' });
      expect(res.error).toBeUndefined();
    });

    expect(mockSetSettings).toHaveBeenCalledTimes(1);
    expect(mockState.customLinks).toEqual(['https://example.com']);
  });

  it('rejects duplicates regardless of www / trailing slash', async () => {
    mockState.customLinks = ['https://www.example.com/'];
    const { result } = renderHook(() => useShortcutsManager());

    await act(async () => {
      const res = await result.current.addShortcut({
        url: 'https://example.com',
      });
      expect(res.error).toBe('This shortcut already exists');
    });

    expect(mockSetSettings).not.toHaveBeenCalled();
  });

  it('treats distinct search params as distinct shortcuts', async () => {
    mockState.customLinks = ['https://example.com/search?q=foo'];
    const { result } = renderHook(() => useShortcutsManager());

    await act(async () => {
      const res = await result.current.addShortcut({
        url: 'https://example.com/search?q=bar',
      });
      expect(res.error).toBeUndefined();
    });

    expect(mockState.customLinks).toEqual([
      'https://example.com/search?q=foo',
      'https://example.com/search?q=bar',
    ]);
  });

  it('undo restores a removed shortcut without stomping concurrent writes', async () => {
    mockState.customLinks = ['https://a.com', 'https://b.com'];
    const { result, rerender } = renderHook(() => useShortcutsManager());

    await act(async () => {
      await result.current.removeShortcut('https://a.com');
    });

    // Simulate a concurrent add landing while the undo toast is still visible.
    mockState.customLinks = ['https://b.com', 'https://c.com'];
    rerender();

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalled();
    });
    const [, options] = mockDisplayToast.mock.calls[0];
    expect(options?.action?.copy).toBe('Undo');

    await act(async () => {
      await options?.action?.onClick();
    });

    // The undo should merge the restored shortcut with the concurrent add,
    // not roll back to the pre-remove snapshot that would lose `c.com`.
    expect(mockState.customLinks).toEqual([
      'https://a.com',
      'https://b.com',
      'https://c.com',
    ]);
  });

  it('imports sites up to the MAX_SHORTCUTS capacity and skips dupes', async () => {
    mockState.customLinks = ['https://a.com'];
    const { result } = renderHook(() => useShortcutsManager());

    await act(async () => {
      const res = await result.current.importFrom('topSites', [
        { url: 'a.com' },
        { url: 'b.com', title: 'B' },
        { url: 'c.com' },
      ]);
      expect(res.imported).toBe(2);
      expect(res.skipped).toBe(1);
    });

    expect(mockState.customLinks).toEqual([
      'https://a.com',
      'https://b.com',
      'https://c.com',
    ]);
  });
});
