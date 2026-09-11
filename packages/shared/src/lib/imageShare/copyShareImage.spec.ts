import { copyShareImage } from './copyShareImage';

class FakeClipboardItem {
  public readonly types: string[];

  constructor(public readonly items: Record<string, Blob | Promise<Blob>>) {
    this.types = Object.keys(items);
  }
}

const write = jest.fn();

beforeEach(() => {
  write.mockReset().mockResolvedValue(undefined);
  Object.assign(globalThis, { ClipboardItem: FakeClipboardItem });
  Object.assign(navigator, { clipboard: { write } });
});

const blob = () => Promise.resolve(new Blob(['png'], { type: 'image/png' }));

describe('copyShareImage', () => {
  it('puts the image on the clipboard and nothing else', async () => {
    await expect(copyShareImage(blob())).resolves.toBe(true);

    const [[[item]]] = write.mock.calls;
    // No text/plain: a link pasted beside the image lands as a stray line in
    // the composer, and the card already names where it came from.
    expect(item.types).toEqual(['image/png']);
  });

  it('hands over the blob unresolved, so the write stays in the gesture', async () => {
    const pending = blob();

    await expect(copyShareImage(pending)).resolves.toBe(true);

    const [[[item]]] = write.mock.calls;
    expect(item.items['image/png']).toBe(pending);
  });

  it('reports failure so the caller can fall back to a download', async () => {
    write.mockRejectedValue(new Error('NotAllowedError'));

    await expect(copyShareImage(blob())).resolves.toBe(false);
  });

  it('reports failure where the clipboard cannot take an image at all', async () => {
    Object.assign(navigator, { clipboard: {} });

    await expect(copyShareImage(blob())).resolves.toBe(false);
    expect(write).not.toHaveBeenCalled();
  });
});
