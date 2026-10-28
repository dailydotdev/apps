import { webcrypto } from 'crypto';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDuplicateCover } from './useDuplicateCover';
import type { TextFormCover } from './TextForm';

const url = 'https://media.daily.dev/image/upload/v1/ugc/body_image';
const body = `![Screenshot](${url})`;
const file = new File(['same image'], 'cover.png', { type: 'image/png' });
const cover = { file, preview: 'blob:cover' };
const originalSubtle = globalThis.crypto.subtle;

beforeEach(() => {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    configurable: true,
    value: webcrypto.subtle,
  });
});

afterAll(() => {
  Object.defineProperty(globalThis.crypto, 'subtle', { value: originalSubtle });
});

it.each([true, false])(
  'detects identical bytes regardless of filename or upload order, cover first: %s',
  async (coverFirst) => {
    const { result, rerender } = renderHook(
      (props: { body: string; cover: TextFormCover | null }) =>
        useDuplicateCover(props),
      { initialProps: { body, cover: coverFirst ? cover : null } },
    );

    await act(async () => {
      await result.current.onImageUpload(
        new File(['same image'], 'pasted.png', { type: 'image/png' }),
        url,
      );
    });
    rerender({ body, cover });

    await waitFor(() => expect(result.current.isDuplicateCover).toBe(true));

    rerender({ body: '', cover });
    expect(result.current.isDuplicateCover).toBe(false);
  },
);

it('does not flag a different image with the same filename and size', async () => {
  const { result } = renderHook(() => useDuplicateCover({ body, cover }));

  await act(async () => {
    await result.current.onImageUpload(
      new File(['other file'], 'cover.png', { type: 'image/png' }),
      url,
    );
  });

  expect(result.current.isDuplicateCover).toBe(false);
});

it('keeps uploads usable when hashing is unavailable', async () => {
  Object.defineProperty(globalThis.crypto, 'subtle', { value: undefined });
  const { result } = renderHook(() => useDuplicateCover({ body, cover }));

  await act(async () => {
    await result.current.onImageUpload(file, url);
  });

  expect(result.current.isDuplicateCover).toBe(false);
});
