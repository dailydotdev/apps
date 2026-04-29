import { detectBrowserExtensionInstalled } from './useIsBrowserExtensionInstalled';

describe('detectBrowserExtensionInstalled', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-daily-extension-installed');
    document.head.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('returns true immediately when the ping marker is present', async () => {
    document.documentElement.dataset.dailyExtensionInstalled = 'true';

    await expect(detectBrowserExtensionInstalled('abc123')).resolves.toBe(true);
  });

  it('cache-busts probe retries for the same extension id', async () => {
    const appendedHrefs: string[] = [];
    const appendChildSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node: Node) => {
        if (node instanceof HTMLLinkElement) {
          appendedHrefs.push(node.href);
          globalThis.setTimeout(() => node.onerror?.(new Event('error')), 0);
        }

        return node;
      });

    await expect(detectBrowserExtensionInstalled('abc123', 50)).resolves.toBe(
      false,
    );
    await expect(detectBrowserExtensionInstalled('abc123', 50)).resolves.toBe(
      false,
    );

    expect(appendChildSpy).toHaveBeenCalledTimes(2);
    expect(appendedHrefs).toHaveLength(2);
    expect(appendedHrefs[0]).not.toBe(appendedHrefs[1]);
    expect(appendedHrefs[0]).toContain(
      'chrome-extension://abc123/js/frame.bundle.js?__daily_probe=',
    );
  });
});
