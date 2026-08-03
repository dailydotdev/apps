// On the extension a root-relative href resolves against
// `chrome-extension://<id>` and 404s; only rows rendered as buttons may keep
// one. See docs/sidebar-links-extension-audit.md.
//
// `__tests__/setup.ts` sets NEXT_PUBLIC_WEBAPP_URL to '/', which makes both
// forms textually identical and these assertions vacuous — hence the re-load
// against a realistic origin.
const WEBAPP_ORIGIN = 'https://app.daily.dev/';

describe('sidebar links on the extension', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_WEBAPP_URL = WEBAPP_ORIGIN;
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_WEBAPP_URL = '/';
  });

  it('gives every shortcut catalog entry an absolute path', async () => {
    // Dock rows are plain links — no button mode to fall back on.
    const { SHORTCUT_CATALOG } = await import('./SidebarShortcutsDock');
    const relative = SHORTCUT_CATALOG.filter(
      (item) => !item.path.startsWith(WEBAPP_ORIGIN),
    ).map((item) => item.id);

    expect(relative).toEqual([]);
  });

  it('absolutises a root-relative path', async () => {
    const { toWebappHref } = await import('../../lib/links');

    expect(toWebappHref('/following')).toEqual(`${WEBAPP_ORIGIN}following`);
    expect(toWebappHref('/tags/javascript')).toEqual(
      `${WEBAPP_ORIGIN}tags/javascript`,
    );
  });

  it('leaves an already absolute path alone', async () => {
    const { toWebappHref } = await import('../../lib/links');

    expect(toWebappHref(`${WEBAPP_ORIGIN}bookmarks`)).toEqual(
      `${WEBAPP_ORIGIN}bookmarks`,
    );
    expect(toWebappHref('https://daily.dev')).toEqual('https://daily.dev');
  });
});
