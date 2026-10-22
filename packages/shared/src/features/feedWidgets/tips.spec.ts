import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { feedWidgetTips, getFeedWidgetTips, pickFeedWidgetTip } from './tips';

describe('feed widget tips', () => {
  it('picks every tip from the set, whatever the draw', () => {
    const tips = getFeedWidgetTips();

    expect(pickFeedWidgetTip(() => 0)).toBe(tips[0]);
    expect(pickFeedWidgetTip(() => 0.999999)).toBe(tips[tips.length - 1]);
    expect(feedWidgetTips).toContain(pickFeedWidgetTip());
  });

  it('gives every tip its own id', () => {
    const ids = feedWidgetTips.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
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
