import browser from 'webextension-polyfill';
import { registerBrowserContentScripts } from './extensionScripts';

jest.mock('webextension-polyfill', () => ({
  contentScripts: {
    register: jest.fn(),
  },
  scripting: {
    getRegisteredContentScripts: jest.fn().mockResolvedValue([]),
    registerContentScripts: jest.fn().mockResolvedValue(undefined),
  },
  permissions: {
    contains: jest.fn(),
    request: jest.fn(),
  },
  runtime: {
    id: 'test-extension',
  },
}));

describe('registerBrowserContentScripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers companion scripts only in the top frame', async () => {
    await registerBrowserContentScripts();

    expect(browser.scripting.registerContentScripts).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'daily-companion-app',
        matches: ['*://*/*'],
        allFrames: false,
        css: ['css/daily-companion-app.css'],
        js: ['js/content.bundle.js', 'js/companion.bundle.js'],
      }),
    ]);
  });
});
