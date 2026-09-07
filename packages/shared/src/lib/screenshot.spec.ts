import { getImageFileFromClipboard, toNaturalRect } from './screenshot';

describe('toNaturalRect', () => {
  const display = { width: 400, height: 300 };
  const natural = { width: 1600, height: 1200 };

  it('scales a selection from displayed to natural pixels', () => {
    expect(
      toNaturalRect(
        { x: 100, y: 75, width: 200, height: 150 },
        display,
        natural,
      ),
    ).toEqual({ x: 400, y: 300, width: 800, height: 600 });
  });

  it('is a no-op when the image is displayed at natural size', () => {
    const rect = { x: 10, y: 20, width: 50, height: 60 };

    expect(toNaturalRect(rect, natural, natural)).toEqual(rect);
  });

  it('clamps the selection to the natural bounds', () => {
    expect(
      toNaturalRect(
        { x: 390, y: 290, width: 50, height: 50 },
        display,
        natural,
      ),
    ).toEqual({ x: 1560, y: 1160, width: 40, height: 40 });
  });
});

describe('getImageFileFromClipboard', () => {
  const image = new File(['image'], 'image.png', { type: 'image/png' });

  const clipboard = (
    data: Partial<Pick<DataTransfer, 'files' | 'items'>>,
  ): DataTransfer => data as unknown as DataTransfer;

  it('returns the first image among the pasted files', () => {
    const text = new File(['notes'], 'notes.txt', { type: 'text/plain' });

    expect(
      getImageFileFromClipboard(
        clipboard({ files: [text, image] as unknown as FileList }),
      ),
    ).toBe(image);
  });

  it('falls back to the clipboard items when files is empty', () => {
    const items = [
      { kind: 'string', type: 'text/plain', getAsFile: () => null },
      { kind: 'file', type: 'image/png', getAsFile: () => image },
    ];

    expect(
      getImageFileFromClipboard(
        clipboard({
          files: [] as unknown as FileList,
          items: items as unknown as DataTransferItemList,
        }),
      ),
    ).toBe(image);
  });

  it('returns null for a text-only clipboard', () => {
    expect(
      getImageFileFromClipboard(
        clipboard({
          files: [] as unknown as FileList,
          items: [
            { kind: 'string', type: 'text/plain', getAsFile: () => null },
          ] as unknown as DataTransferItemList,
        }),
      ),
    ).toBeNull();
  });

  it('returns null without clipboard data', () => {
    expect(getImageFileFromClipboard(null)).toBeNull();
  });

  // An unsupported image type must still come through so the caller's
  // isValidImageType() check is what reports it to the user.
  it('returns an unsupported image type for the caller to reject', () => {
    const bitmap = new File(['bmp'], 'image.bmp', { type: 'image/bmp' });

    expect(
      getImageFileFromClipboard(
        clipboard({ files: [bitmap] as unknown as FileList }),
      ),
    ).toBe(bitmap);
  });
});
