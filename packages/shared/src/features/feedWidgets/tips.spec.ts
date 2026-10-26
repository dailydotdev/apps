import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  feedWidgetTipGroups,
  feedWidgetTips,
  getFeedWidgetTips,
  pickFeedWidgetTip,
} from './tips';

describe('feed widget tips', () => {
  it('picks every tip from the set, whatever the draw', () => {
    const tips = getFeedWidgetTips();

    expect(pickFeedWidgetTip(tips, 0)).toBe(tips[0]);
    expect(pickFeedWidgetTip(tips, 0.999999)).toBe(tips[tips.length - 1]);
    expect(feedWidgetTips).toContain(pickFeedWidgetTip(tips, Math.random()));
  });

  it('gives every tip its own id', () => {
    const ids = feedWidgetTips.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every tip the rail copy and a tips page section', () => {
    feedWidgetTips.forEach(({ id, headline, blurb, cta, group }) => {
      expect({ id, headline, blurb, cta }).toEqual({
        id,
        headline: expect.stringMatching(/\S/),
        blurb: expect.stringMatching(/\S/),
        cta: expect.stringMatching(/\S/),
      });
      expect(feedWidgetTipGroups).toContain(group);
    });
  });

  it('leaves the extension tip out where it cannot be added', () => {
    const browserOnly = feedWidgetTips.filter((tip) => tip.isBrowserOnly);
    expect(browserOnly.length).toBeGreaterThan(0);

    expect(getFeedWidgetTips()).toEqual(feedWidgetTips);
    expect(getFeedWidgetTips({ canAddExtension: false })).toEqual(
      feedWidgetTips.filter((tip) => !tip.isBrowserOnly),
    );
  });

  it('names Edge on the extension tip in Edge', () => {
    const extension = getFeedWidgetTips({ isEdge: true }).find(
      (tip) => tip.isBrowserOnly,
    );

    expect(extension?.cta).toBe('Add to Edge');
  });

  it('leaves the extension tip out of the extension', () => {
    process.env.TARGET_BROWSER = 'chrome';
    try {
      jest.isolateModules(() => {
        /* eslint-disable global-require, @typescript-eslint/no-var-requires */
        const inExtension: {
          getFeedWidgetTips: typeof getFeedWidgetTips;
        } = require('./tips');
        /* eslint-enable global-require, @typescript-eslint/no-var-requires */

        expect(
          inExtension.getFeedWidgetTips().map(({ id }) => id),
        ).not.toContain('extension');
      });
    } finally {
      delete process.env.TARGET_BROWSER;
    }
  });

  // Jest mocks every svg, so the files themselves are checked: the tile
  // colors its glyph through the light fill svgr turns into `currentcolor`,
  // and an icon drawn only with inherited fills shows as an empty tile.
  it('draws every tip icon with a fill the tile can show', () => {
    const source = readFileSync(join(__dirname, 'tips.ts'), 'utf8');
    const iconDirs = Array.from(
      source.matchAll(/components\/icons\/(\w+)'/g),
      ([, dir]) => dir,
    );
    expect(iconDirs.length).toBeGreaterThan(0);

    iconDirs.forEach((dir) => {
      const root = join(__dirname, '../../components/icons', dir);
      readdirSync(root)
        .filter((file) => file.endsWith('.svg'))
        .forEach((file) => {
          const svg = readFileSync(join(root, file), 'utf8');
          expect({
            file: `${dir}/${file}`,
            hasFill: /fill="(#fff|#ffffff|white|currentcolor)"/i.test(svg),
          }).toEqual({ file: `${dir}/${file}`, hasFill: true });
        });
    });
  });
});
