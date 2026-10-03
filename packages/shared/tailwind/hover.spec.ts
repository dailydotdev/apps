import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../tailwind.config';

const build = async (classes: string): Promise<string> => {
  const result = await postcss([
    tailwindcss({ ...config, content: [{ raw: `<div class="${classes}">` }] }),
  ]).process('@tailwind utilities;', { from: undefined });

  return result.css;
};

describe('hover variant', () => {
  it('is hover with a pointer and the pressed state on touch', async () => {
    const css = await build('hover:underline');

    expect(css).toContain('@media (hover: hover)');
    expect(css).toContain('.hover\\:underline:hover');
    expect(css).toContain('@media (hover: none)');
    expect(css).toContain('.hover\\:underline:active');
  });

  it('keeps its place in the cascade, ahead of focus and active', async () => {
    const css = await build('hover:underline focus:underline active:underline');
    const hover = css.indexOf('.hover\\:underline:hover');

    expect(hover).toBeGreaterThan(-1);
    expect(hover).toBeLessThan(css.indexOf('.focus\\:underline:focus'));
    expect(hover).toBeLessThan(css.indexOf('.active\\:underline:active'));
  });
});
