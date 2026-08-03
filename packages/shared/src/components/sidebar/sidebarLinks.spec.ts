// The extension renders the same sidebar from `chrome-extension://<id>`, where
// a root-relative href resolves against the extension origin and 404s. A path
// may only stay relative when its row renders as a BUTTON — the extension
// passes `isNavItemsButton`, and `Section` turns those rows into buttons that
// switch the feed in place. Anything rendered as a plain link must be absolute.
//
// `__tests__/setup.ts` sets NEXT_PUBLIC_WEBAPP_URL to '/', which makes the two
// forms textually identical and the assertions below vacuous, so these re-load
// the modules against a realistic origin.
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
    // Dock rows are plain links — there is no button mode to fall back on.
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
