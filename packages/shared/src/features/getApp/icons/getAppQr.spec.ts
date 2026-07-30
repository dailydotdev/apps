import { readFileSync } from 'fs';
import { join } from 'path';
import {
  decodeMatrix,
  parseStrokePath,
} from '../../../../__tests__/helpers/qr';

// The destination the committed matrix must encode. If this URL needs to
// change, regenerate the asset (instructions inside the svg) and update this
// constant in the same commit - this spec exists to make CI fail when only
// one of the two moves.
const EXPECTED_URL = 'https://r.daily.dev/get?utm_source=header_qr';

describe('getAppQr.svg', () => {
  const svg = readFileSync(join(__dirname, 'getAppQr.svg'), 'utf8');
  const d = svg.match(/<path stroke="#000000" d="([^"]+)"/)?.[1] ?? '';

  it('should decode to the expected URL', () => {
    expect(d).toBeTruthy();

    expect(decodeMatrix(parseStrokePath(d))).toBe(EXPECTED_URL);
  });

  it('should declare a viewBox matching the matrix plus the quiet zone', () => {
    const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    const size = parseStrokePath(d).length;

    expect(Number(viewBox?.[1])).toBe(size + 8);
    expect(Number(viewBox?.[2])).toBe(size + 8);
  });
});
