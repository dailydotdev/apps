import { getAddTileKinds } from './FeedWidgetAddTile';
import { FeedWidgetKind } from './types';

describe('getAddTileKinds', () => {
  it('leads with shortcuts in the extension', () => {
    expect(
      getAddTileKinds({ onRail: [], isLoggedIn: true, isExtension: true }),
    ).toEqual([
      FeedWidgetKind.Shortcuts,
      FeedWidgetKind.HappeningNow,
      FeedWidgetKind.TodoList,
      FeedWidgetKind.Streak,
    ]);
  });

  it('skips kinds already on the rail and kinds that need an account', () => {
    expect(
      getAddTileKinds({
        onRail: [FeedWidgetKind.Shortcuts],
        isLoggedIn: false,
        isExtension: false,
      }),
    ).toEqual([FeedWidgetKind.HappeningNow]);
  });
});
