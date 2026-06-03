import { LazyModal } from '../modals/common/types';
import { ThemeMode } from '../../contexts/SettingsContext';
import {
  type SpotlightAction,
  SpotlightActionGroup,
  SpotlightActionKind,
} from '../../graphql/spotlight';
import {
  dispatchSpotlightAction,
  type SpotlightDispatchDeps,
} from './dispatcher';
import { SpotlightScope } from './types';

const buildAction = (overrides: Partial<SpotlightAction>): SpotlightAction => ({
  id: 'test-action',
  group: SpotlightActionGroup.Actions,
  title: 'Test',
  icon: 'Plus',
  keywords: [],
  kind: SpotlightActionKind.Navigate,
  payload: {},
  ...overrides,
});

const buildDeps = (
  overrides: Partial<SpotlightDispatchDeps> = {},
): SpotlightDispatchDeps => ({
  router: { push: jest.fn() },
  openModal: jest.fn(),
  settings: {
    themeMode: ThemeMode.Dark,
    insaneMode: false,
    setTheme: jest.fn().mockResolvedValue(undefined),
    toggleSidebarExpanded: jest.fn().mockResolvedValue(undefined),
    toggleInsaneMode: jest.fn().mockResolvedValue(undefined),
  } as unknown as SpotlightDispatchDeps['settings'],
  user: { username: 'foo' },
  logout: jest.fn().mockResolvedValue(undefined),
  pushScope: jest.fn(),
  ...overrides,
});

/* eslint-disable no-template-curly-in-string -- ${username} is a literal path token resolved by the Navigate dispatcher. */

describe('dispatchSpotlightAction', () => {
  it('opens a modal by LazyModal key', async () => {
    const deps = buildDeps();
    await dispatchSpotlightAction(
      buildAction({
        kind: SpotlightActionKind.OpenModal,
        payload: { modal: 'NewSource', props: { x: 1 } },
      }),
      deps,
    );
    expect(deps.openModal).toHaveBeenCalledWith({
      type: LazyModal.NewSource,
      props: { x: 1 },
    });
  });

  it('rejects unknown modal keys', async () => {
    await expect(
      dispatchSpotlightAction(
        buildAction({
          kind: SpotlightActionKind.OpenModal,
          payload: { modal: 'NotARealModal' },
        }),
        buildDeps(),
      ),
    ).rejects.toThrow(/unknown modal/);
  });

  it('routes Navigate via router.push with absolute webapp URL prefix', async () => {
    const deps = buildDeps();
    await dispatchSpotlightAction(
      buildAction({
        kind: SpotlightActionKind.Navigate,
        payload: { path: '/bookmarks' },
      }),
      deps,
    );
    expect(deps.router.push).toHaveBeenCalledTimes(1);
    expect((deps.router.push as jest.Mock).mock.calls[0][0]).toMatch(
      /bookmarks$/,
    );
  });

  it('substitutes ${username} in Navigate paths', async () => {
    const deps = buildDeps();
    await dispatchSpotlightAction(
      buildAction({
        kind: SpotlightActionKind.Navigate,
        payload: { path: '/${username}' },
      }),
      deps,
    );
    expect((deps.router.push as jest.Mock).mock.calls[0][0]).toMatch(/\/foo$/);
  });

  it('throws when a Navigate path token cannot be resolved', async () => {
    const deps = buildDeps({ user: null });
    await expect(
      dispatchSpotlightAction(
        buildAction({
          kind: SpotlightActionKind.Navigate,
          payload: { path: '/${username}' },
        }),
        deps,
      ),
    ).rejects.toThrow(/missing token "username"/);
  });

  it('toggles theme via settings.setTheme', async () => {
    const deps = buildDeps();
    await dispatchSpotlightAction(
      buildAction({
        kind: SpotlightActionKind.ToggleSetting,
        payload: { key: 'theme' },
      }),
      deps,
    );
    expect(deps.settings.setTheme).toHaveBeenCalledWith(ThemeMode.Light);
  });

  it('rejects unknown setting key', async () => {
    await expect(
      dispatchSpotlightAction(
        buildAction({
          kind: SpotlightActionKind.ToggleSetting,
          payload: { key: 'whatever' },
        }),
        buildDeps(),
      ),
    ).rejects.toThrow(/invalid payload for ToggleSetting/);
  });

  it('maps search handlers to scope pushes and keeps Spotlight open', async () => {
    const deps = buildDeps();
    const result = await dispatchSpotlightAction(
      buildAction({
        kind: SpotlightActionKind.RunClientAction,
        payload: { handlerId: 'searchTags' },
      }),
      deps,
    );
    expect(deps.pushScope).toHaveBeenCalledWith(SpotlightScope.Tags);
    expect(result).toEqual({ keepOpen: true });
  });

  it('runs logout via deps.logout', async () => {
    const deps = buildDeps();
    await dispatchSpotlightAction(
      buildAction({
        kind: SpotlightActionKind.RunClientAction,
        payload: { handlerId: 'logout' },
      }),
      deps,
    );
    expect(deps.logout).toHaveBeenCalled();
  });

  it('rejects unknown client handler', async () => {
    await expect(
      dispatchSpotlightAction(
        buildAction({
          kind: SpotlightActionKind.RunClientAction,
          payload: { handlerId: 'noSuchHandler' },
        }),
        buildDeps(),
      ),
    ).rejects.toThrow(/unknown client handler/);
  });
});
