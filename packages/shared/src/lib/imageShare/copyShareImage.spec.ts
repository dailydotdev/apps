import { copyShareImage } from './copyShareImage';

const LINK = 'https://app.daily.dev/posts/p1';

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
  it('puts the image and the link on the clipboard together', async () => {
    await expect(copyShareImage(blob(), LINK)).resolves.toBe(true);

    const [[[item]]] = write.mock.calls;
    expect(item.types).toEqual(['image/png', 'text/plain']);
    // A promise, so the write stays inside the gesture while the short link
    // is still being fetched. jsdom's Blob has no text(); size is its bytes.
    const text = await (item.items['text/plain'] as Promise<Blob>);
    expect(text.type).toBe('text/plain');
    expect(text.size).toBe(LINK.length);
  });

  it('accepts a link that is still resolving', async () => {
    const pending = new Promise<string>((resolve) => {
      setTimeout(() => resolve(LINK), 0);
    });

    await expect(copyShareImage(blob(), pending)).resolves.toBe(true);

    const [[[item]]] = write.mock.calls;
    const text = await (item.items['text/plain'] as Promise<Blob>);
    expect(text.size).toBe(LINK.length);
  });

  it('keeps the image when a browser refuses two representations', async () => {
    write.mockRejectedValueOnce(new Error('NotAllowedError'));

    await expect(copyShareImage(blob(), LINK)).resolves.toBe(true);

    expect(write).toHaveBeenCalledTimes(2);
    const [, [[retry]]] = write.mock.calls;
    expect(retry.types).toEqual(['image/png']);
  });

  it('copies the image alone when there is no link to carry', async () => {
    await expect(copyShareImage(blob())).resolves.toBe(true);

    const [[[item]]] = write.mock.calls;
    expect(item.types).toEqual(['image/png']);
  });

  it('reports failure so the caller can fall back to a download', async () => {
    write.mockRejectedValue(new Error('NotAllowedError'));

    await expect(copyShareImage(blob(), LINK)).resolves.toBe(false);
  });
});
