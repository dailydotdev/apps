import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss-modules';
import del from 'rollup-plugin-delete';

import packageJson from './package.json';

import fs from 'fs';
import glob from 'glob';

/* initialize CSS files because of a catch-22 situation:
   https://github.com/rollup/rollup/issues/1404 */
glob.sync('src/**/*.css').forEach((css) => {
  // Use forEach because https://github.com/rollup/rollup/issues/1873
  const definition = `${css}.d.ts`;
  if (!fs.existsSync(definition))
    fs.writeFileSync(
      definition,
      'const mod: { [cls: string]: string }\nexport default mod\n',
    );
});

export default {
  input: './src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    del({ targets: 'dist/*' }),
    postcss({
      extract: true,
      modules: true,
      writeDefinitions: true,
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
  ],
};
