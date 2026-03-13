import { readFileSync } from 'fs';
import path from 'path';

describe('safe area styles', () => {
  it('applies top safe-area offsets without an iOS-only html class', () => {
    const stylesheetPath = path.join(
      __dirname,
      '..',
      '..',
      'shared',
      'src',
      'styles',
      'ios.css',
    );
    const stylesheet = readFileSync(stylesheetPath, 'utf8');

    expect(stylesheet).not.toContain('.ios {');
    expect(stylesheet).toContain('body::before {');
    expect(stylesheet).toContain('body {');
    expect(stylesheet).toContain('.antialiased > .sticky.top-0,');
    expect(stylesheet).toContain('.fixed.inset-0 {');
    expect(stylesheet).toContain('height: env(safe-area-inset-top);');
    expect(stylesheet).toContain('padding-top: env(safe-area-inset-top);');
    expect(stylesheet).toContain('top: env(safe-area-inset-top);');
    expect(stylesheet).toContain(
      'min-height: calc(100dvh - env(safe-area-inset-top));',
    );
    expect(stylesheet).toContain(
      'max-height: calc(100dvh - env(safe-area-inset-top));',
    );
  });
});
