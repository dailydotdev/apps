import { feedHeroShape } from './feedHeroShape';

describe('feedHeroShape', () => {
  // The row has to come out exactly as wide as the grid under it, or the
  // section's edges land next to the feed's instead of on them. One column is
  // not in this: the section stacks there rather than laying out on a grid.
  it.each([2, 3, 4, 5, 6])('fills all %i columns', (columns) => {
    const { featuredSpan, railSpan, adSpan } = feedHeroShape(columns);

    expect(featuredSpan + railSpan + adSpan).toBe(columns);
  });

  it('stacks the phone, where there is one column to share', () => {
    expect(feedHeroShape(1)).toMatchObject({
      layout: 'stacked',
      adPlacement: 'none',
    });
  });

  // Whatever the count says: a grid hero over a list feed reads as two
  // different things stacked on each other.
  it.each([2, 3, 4, 5, 6])(
    'stacks a %i-column feed that renders as a list',
    (columns) => {
      expect(feedHeroShape(columns, true)).toMatchObject({
        columns: 1,
        layout: 'stacked',
        adPlacement: 'none',
      });
    },
  );

  it('gives the rail a column of its own from two columns up', () => {
    expect(feedHeroShape(2)).toMatchObject({ featuredSpan: 1, railSpan: 1 });
  });

  // One column is a feed card, which is what the standard card is drawn for;
  // the wide card only earns its shape back across two.
  it('takes the standard card at one column and the wide card beyond it', () => {
    expect(feedHeroShape(2).layout).toBe('split');
    expect(feedHeroShape(3).layout).toBe('wide');
  });

  // Below four columns the feed keeps the placement and shows it in its own
  // slot rather than the hero squeezing a different-shaped one in.
  it('spares the ad a column only once there are four', () => {
    expect(feedHeroShape(3)).toMatchObject({ adSpan: 0, adPlacement: 'none' });
    expect(feedHeroShape(4)).toMatchObject({
      adSpan: 1,
      adPlacement: 'column',
    });
  });

  // The featured card takes the slack as the grid widens, up to the point
  // where the headline list has earned a second column too.
  it('widens the featured card, then the rail', () => {
    expect(feedHeroShape(4)).toMatchObject({ featuredSpan: 2, railSpan: 1 });
    expect(feedHeroShape(5)).toMatchObject({ featuredSpan: 3, railSpan: 1 });
    expect(feedHeroShape(6)).toMatchObject({ featuredSpan: 3, railSpan: 2 });
  });
});
