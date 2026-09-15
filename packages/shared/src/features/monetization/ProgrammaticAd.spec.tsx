import {
  FORMAT_SPEC,
  ProgrammaticAdFormat,
  resolveAdSizes,
} from './ProgrammaticAd';

const leaderboard = FORMAT_SPEC[ProgrammaticAdFormat.Leaderboard];
const rectangle = FORMAT_SPEC[ProgrammaticAdFormat.Rectangle];

describe('resolveAdSizes', () => {
  it('offers only the sizes the slot has room for', () => {
    // A leaderboard in a phone-width column can only be the banner: offering
    // 728x90 would win a creative the column cannot show.
    expect(resolveAdSizes(leaderboard, {}, 360)).toEqual([[320, 100]]);
    expect(resolveAdSizes(leaderboard, {}, 780)).toEqual([
      [728, 90],
      [320, 100],
    ]);
  });

  it('falls back to the narrowest size when nothing fits', () => {
    expect(resolveAdSizes(rectangle, {}, 0)).toEqual([[300, 250]]);
  });

  it('honours a booked size over the format range', () => {
    // The pinned and sticky placements are booked at one size, so no wider or
    // taller creative can take over a permanently visible part of the screen.
    expect(resolveAdSizes(leaderboard, { sizes: [[320, 50]] }, 1200)).toEqual([
      [320, 50],
    ]);
  });
});
