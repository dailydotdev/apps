import { mergeRailOrder } from './railOrder';

describe('mergeRailOrder', () => {
  // Mirrors the rail's default order: the tabs, then the avatar, then New post.
  const defaults = [
    'main',
    'squads',
    'notifications',
    'gameCenter',
    'profile',
    'create',
  ];

  it('should use the default order when nothing is saved', () => {
    expect(mergeRailOrder([], defaults)).toEqual(defaults);
  });

  it('should return a copy the caller cannot mutate the defaults through', () => {
    const merged = mergeRailOrder([], defaults);

    expect(merged).not.toBe(defaults);

    merged.push('injected');

    expect(defaults).not.toContain('injected');
  });

  it('should keep a saved order the user dragged', () => {
    const saved = [
      'create',
      'profile',
      'gameCenter',
      'notifications',
      'squads',
      'main',
    ];

    expect(mergeRailOrder(saved, defaults)).toEqual(saved);
  });

  it('should drop ids that are no longer on the rail', () => {
    const saved = ['main', 'retiredTab', 'squads'];

    expect(mergeRailOrder(saved, ['main', 'squads'])).toEqual([
      'main',
      'squads',
    ]);
  });

  it('should land the avatar above New post for layouts saved before it existed', () => {
    const saved = ['main', 'squads', 'notifications', 'gameCenter', 'create'];

    expect(mergeRailOrder(saved, defaults)).toEqual([
      'main',
      'squads',
      'notifications',
      'gameCenter',
      'profile',
      'create',
    ]);
  });

  it('should land New post last for layouts saved before it existed', () => {
    const saved = ['main', 'squads', 'notifications', 'gameCenter', 'profile'];

    expect(mergeRailOrder(saved, defaults)).toEqual(defaults);
  });

  it('should anchor a new item to its default neighbour inside a custom order', () => {
    // The user moved the streak tab to the top; the avatar they have never seen
    // still belongs after it, since gameCenter is what precedes it by default.
    const saved = ['gameCenter', 'main', 'squads', 'notifications', 'create'];

    expect(mergeRailOrder(saved, defaults)).toEqual([
      'gameCenter',
      'profile',
      'main',
      'squads',
      'notifications',
      'create',
    ]);
  });

  it('should put a new leading item first when nothing precedes it', () => {
    const saved = ['squads', 'main'];

    expect(mergeRailOrder(saved, ['notifications', 'squads', 'main'])).toEqual([
      'notifications',
      'squads',
      'main',
    ]);
  });

  it('should not mutate its inputs', () => {
    const saved = ['main', 'squads'];
    const savedCopy = [...saved];
    const defaultsCopy = [...defaults];

    mergeRailOrder(saved, defaults);

    expect(saved).toEqual(savedCopy);
    expect(defaults).toEqual(defaultsCopy);
  });
});
