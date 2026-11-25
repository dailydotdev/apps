import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../tailwind.config';

const build = async (classes: string): Promise<string> => {
  const result = await postcss([
    tailwindcss({ ...config, content: [{ raw: `<div class="${classes}">` }] }),
  ]).process('@tailwind components;', { from: undefined });

  return result.css;
};

describe('button plugins', () => {
  it('keeps the colored ButtonV2 values its template strings build', async () => {
    const css = await build('btn-v2');

    expect(css).toMatch(
      /\.btn-v2-tertiary-cabbage\s*\{\s*--btn-v2-d-default-color/,
    );
  });
});
