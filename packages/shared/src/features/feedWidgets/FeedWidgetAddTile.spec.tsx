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
    ).toEqual({
      addable: [
        FeedWidgetKind.Shortcuts,
        FeedWidgetKind.HappeningNow,
        FeedWidgetKind.TodoList,
        FeedWidgetKind.Streak,
      ],
      fanned: [
        FeedWidgetKind.Shortcuts,
        FeedWidgetKind.HappeningNow,
        FeedWidgetKind.TodoList,
      ],
    });
  });

  it('skips kinds already on the rail and kinds that need an account', () => {
    expect(
      getAddTileKinds({
        onRail: [FeedWidgetKind.Shortcuts],
        isLoggedIn: false,
        isReadingStreakOn: true,
        isExtension: false,
      }),
    ).toEqual({
      addable: [FeedWidgetKind.HappeningNow],
      fanned: [FeedWidgetKind.HappeningNow, FeedWidgetKind.Shortcuts],
    });
  });

  it('skips streak when the reader turned reading streaks off', () => {
    expect(
      getAddTileKinds({
        onRail: [],
        isLoggedIn: true,
        isReadingStreakOn: false,
        isExtension: false,
      }),
    ).toEqual({
      addable: [
        FeedWidgetKind.HappeningNow,
        FeedWidgetKind.TodoList,
        FeedWidgetKind.Shortcuts,
        FeedWidgetKind.ReadingList,
      ],
      fanned: [
        FeedWidgetKind.HappeningNow,
        FeedWidgetKind.TodoList,
        FeedWidgetKind.Shortcuts,
      ],
    });
  });

  it('still fans cards when every suggestion is already on the rail', () => {
    expect(
      getAddTileKinds({
        onRail: [
          FeedWidgetKind.HappeningNow,
          FeedWidgetKind.TodoList,
          FeedWidgetKind.Shortcuts,
          FeedWidgetKind.Streak,
          FeedWidgetKind.ReadingList,
        ],
        isLoggedIn: true,
        isReadingStreakOn: true,
        isExtension: false,
      }),
    ).toEqual({
      addable: [],
      fanned: [
        FeedWidgetKind.HappeningNow,
        FeedWidgetKind.TodoList,
        FeedWidgetKind.Shortcuts,
      ],
    });
  });
});
