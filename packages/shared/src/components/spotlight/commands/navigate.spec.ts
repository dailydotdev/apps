import { getNavigateCommands } from './navigate';
import { SpotlightGroup } from '../types';

describe('getNavigateCommands', () => {
  const router = { push: jest.fn() };

  beforeEach(() => {
    router.push.mockReset();
  });

  it('returns commands in the Navigate group only', () => {
    const commands = getNavigateCommands({ router, user: null });
    expect(commands).not.toHaveLength(0);
    commands.forEach((command) => {
      expect(command.group).toBe(SpotlightGroup.Navigate);
    });
  });

  it('uses the verb-prefix convention on every title', () => {
    const commands = getNavigateCommands({ router, user: null });
    commands.forEach((command) => {
      expect(command.title.startsWith('Go to')).toBe(true);
    });
  });

  it('appends a profile shortcut when a user is provided', () => {
    const withUser = getNavigateCommands({
      router,
      user: { username: 'jane' },
    });
    expect(withUser.find((cmd) => cmd.id === 'nav.profile')).toBeDefined();

    const withoutUser = getNavigateCommands({ router, user: null });
    expect(withoutUser.find((cmd) => cmd.id === 'nav.profile')).toBeUndefined();
  });

  it('marks personal routes as auth-required', () => {
    const commands = getNavigateCommands({ router, user: null });
    const myFeed = commands.find((cmd) => cmd.id === 'nav.my-feed');
    const popular = commands.find((cmd) => cmd.id === 'nav.popular');
    expect(myFeed?.requiresAuth).toBe(true);
    expect(popular?.requiresAuth).toBeUndefined();
  });

  it('routes via webappUrl when perform is invoked', () => {
    process.env.NEXT_PUBLIC_WEBAPP_URL = 'https://example.test/';
    // Re-require the module so it picks up the constant under the new env.
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const navigateModule = require('./navigate');
    const commands = navigateModule.getNavigateCommands({ router, user: null });
    const popular = commands.find(
      (cmd: { id: string }) => cmd.id === 'nav.popular',
    );
    popular.perform();
    expect(router.push).toHaveBeenCalledWith('https://example.test/posts');
  });
});
