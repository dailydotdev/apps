import jsQR from 'jsqr';

// The repo ships two hand-committed QR matrices (the header get-app asset and
// the onboarding signup panel). Their destination URLs live in code, but the
// matrices are opaque path strings - if one moves without the other being
// regenerated, the only symptom is a scan landing on a stale destination.
// These helpers parse a committed path back into a module matrix and decode it
// the way a phone camera would (via jsQR), so a spec can assert the committed
// pixels still say what the code claims. Decoding rather than re-encoding
// keeps the assertion valid regardless of which generator or mask pattern
// produced the asset.

type Matrix = boolean[][];

// Stroke-run format, as emitted by `npx qrcode -t svg`: rows drawn as
// 1px-tall horizontal strokes on half-pixel centres, e.g.
// `M4 4.5h7m2 0h2` = at row 4 draw 7 modules from col 4, skip 2, draw 2.
// `quietZone` is the generator's fixed 4-module margin baked into the coords.
export const parseStrokePath = (d: string, quietZone = 4): Matrix => {
  const cells: Array<[number, number]> = [];
  const rowRuns = d.split('M').filter(Boolean);

  rowRuns.forEach((run) => {
    const [, xStart, yCentre] = run.match(/^([\d.]+) ([\d.]+)/) ?? [];
    const row = Math.floor(Number(yCentre)) - quietZone;
    let col = Number(xStart) - quietZone;

    Array.from(run.matchAll(/([hm])(-?[\d.]+)/g)).forEach(([, op, a]) => {
      const n = Number(a);
      if (op === 'h') {
        for (let i = 0; i < n; i += 1) {
          cells.push([row, col + i]);
        }
      }
      col += n;
    });
  });

  const size = Math.max(...cells.map(([row]) => row)) + 1;
  const matrix: Matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );
  cells.forEach(([row, col]) => {
    matrix[row][col] = true;
  });

  return matrix;
};

// Rect format, as used by the hand-flattened onboarding matrix:
// `M0 0h7v1h-7z` = a 7-module run at row 0, col 0. Coordinates are already
// module-space (the quiet zone lives in the viewBox origin instead).
export const parseRectPath = (d: string): Matrix => {
  const rects = Array.from(d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\3z/g));
  const size = Math.max(...rects.map(([, , y]) => Number(y))) + 1;
  const matrix: Matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false),
  );

  rects.forEach(([, x, y, w]) => {
    for (let i = 0; i < Number(w); i += 1) {
      matrix[Number(y)][Number(x) + i] = true;
    }
  });

  return matrix;
};

// Rasterises the matrix into greyscale RGBA (scaled up, with a real quiet
// zone) and runs the same decoder a scanner pipeline would.
export const decodeMatrix = (matrix: Matrix): string | null => {
  const scale = 4;
  const quiet = 4 * scale;
  const px = matrix.length * scale + quiet * 2;
  const rgba = new Uint8ClampedArray(px * px * 4).fill(255);

  matrix.forEach((rowCells, row) => {
    rowCells.forEach((dark, col) => {
      if (!dark) {
        return;
      }
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const x = quiet + col * scale + dx;
          const y = quiet + row * scale + dy;
          const at = (y * px + x) * 4;
          rgba[at] = 0;
          rgba[at + 1] = 0;
          rgba[at + 2] = 0;
        }
      }
    });
  });

  return jsQR(rgba, px, px)?.data ?? null;
};
