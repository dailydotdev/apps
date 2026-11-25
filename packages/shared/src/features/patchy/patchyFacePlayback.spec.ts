import { renderHook, waitFor } from '@testing-library/react';
import { usePatchyFaceUrl } from './patchyFacePlayback';

const src = 'https://media.daily.dev/image/upload/v1/public/face.webp';

describe('usePatchyFaceUrl', () => {
  let created = 0;
  const revoked: string[] = [];
  const fetchMock = jest.fn(() =>
    Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }),
  );

  beforeEach(() => {
    created = 0;
    revoked.length = 0;
    global.fetch = fetchMock as unknown as typeof fetch;
    URL.createObjectURL = jest.fn(() => {
      created += 1;
      return `blob:play-${created}`;
    });
    URL.revokeObjectURL = jest.fn((url: string) => {
      revoked.push(url);
    });
  });

  it('gives every play its own URL from one download, and frees the last', async () => {
    const { result, rerender } = renderHook(
      ({ playKey }) => usePatchyFaceUrl(src, playKey, true),
      { initialProps: { playKey: 'reaction-1' } },
    );
    expect(result.current).toBe(src);
    await waitFor(() => expect(result.current).toBe('blob:play-1'));

    rerender({ playKey: 'reaction-2' });
    expect(result.current).toBe('blob:play-2');
    expect(revoked).toEqual(['blob:play-1']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the plain URL for a looping face', () => {
    const { result } = renderHook(() =>
      usePatchyFaceUrl(`${src}?loop`, 'idle-1', false),
    );
    expect(result.current).toBe(`${src}?loop`);
    expect(fetchMock).not.toHaveBeenCalledWith(`${src}?loop`);
  });
});
