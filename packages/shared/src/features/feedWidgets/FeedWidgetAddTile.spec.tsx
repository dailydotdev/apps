import { getAddTileKinds } from './FeedWidgetAddTile';
import { FeedWidgetKind } from './types';

describe('getAddTileKinds', () => {
  it('leads with shortcuts in the extension', () => {
    expect(
      getAddTileKinds({
        onRail: [],
        isLoggedIn: true,
        isReadingStreakOn: true,
        isExtension: true,
      }),
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
        isReadingStreakOn: true,
        isExtension: false,
      }),
    ).toEqual([FeedWidgetKind.HappeningNow]);
  });

  it('skips streak when the reader turned reading streaks off', () => {
    expect(
      getAddTileKinds({
        onRail: [],
        isLoggedIn: true,
        isReadingStreakOn: false,
        isExtension: false,
      }),
    ).toEqual([
      FeedWidgetKind.HappeningNow,
      FeedWidgetKind.TodoList,
      FeedWidgetKind.Shortcuts,
      FeedWidgetKind.ReadingList,
    ]);
  });
});
