import { DOWNSCALE_MAX_DIMENSION, downscaleImage } from './downscaleImage';

const MB = 1024 * 1024;

const fileOf = (size: number, type: string, name = 'photo.jpg'): File =>
  new File([new Uint8Array(size)], name, { type });

describe('downscaleImage', () => {
  const drawImage = jest.fn();
  let encoded: { type: string; size: number } | null;
  const originalCreateImageBitmap = globalThis.createImageBitmap;

  beforeEach(() => {
    drawImage.mockClear();
    encoded = { type: 'image/jpeg', size: 300 * 1024 };
    globalThis.createImageBitmap = jest.fn().mockResolvedValue({
      width: 4000,
      height: 3000,
      close: jest.fn(),
    });
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(function toBlob(callback, type) {
        callback(
          encoded &&
            new Blob([new Uint8Array(encoded.size)], {
              type: encoded.type === 'requested' ? type : encoded.type,
            }),
        );
      });
  });

  afterEach(() => {
    globalThis.createImageBitmap = originalCreateImageBitmap;
    jest.restoreAllMocks();
  });

  it('shrinks a large photo to the longest side limit', async () => {
    const file = fileOf(8 * MB, 'image/jpeg', 'IMG_2041.jpeg');

    const result = await downscaleImage(file);

    expect(result).not.toBe(file);
    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('IMG_2041.jpg');
    expect(result.size).toBe(300 * 1024);
    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      DOWNSCALE_MAX_DIMENSION,
      1536,
    );
  });

  it('turns a large PNG into WebP, which keeps transparency', async () => {
    encoded = { type: 'requested', size: 500 * 1024 };

    const result = await downscaleImage(fileOf(6 * MB, 'image/png', 'a.png'));

    expect(result.type).toBe('image/webp');
    expect(result.name).toBe('a.webp');
  });

  it.each([
    ['a small file', fileOf(200 * 1024, 'image/jpeg')],
    ['an AVIF it does not re-encode', fileOf(6 * MB, 'image/avif')],
  ])('keeps %s as it is', async (_, file) => {
    expect(await downscaleImage(file)).toBe(file);
    expect(globalThis.createImageBitmap).not.toHaveBeenCalled();
  });

  it('keeps the original when the browser cannot encode the type', async () => {
    encoded = { type: 'image/png', size: 300 * 1024 };
    const file = fileOf(6 * MB, 'image/png', 'a.png');

    expect(await downscaleImage(file)).toBe(file);
  });

  it('keeps the original when it cannot decode the file', async () => {
    jest.mocked(globalThis.createImageBitmap).mockRejectedValue(new Error());
    const file = fileOf(6 * MB, 'image/jpeg');

    expect(await downscaleImage(file)).toBe(file);
  });
});
