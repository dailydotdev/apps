import { act, renderHook } from '@testing-library/react';
import { useCopyLink } from './useCopy';

const mockDisplayToast = jest.fn();
const mockWriteText = jest.fn();

jest.mock('./useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('./utils/useGetShortUrl', () => ({
  useGetShortUrl: () => ({ getShortUrl: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
});

it('copies the link and reports the copied state', async () => {
  mockWriteText.mockResolvedValue(undefined);
  const { result } = renderHook(() => useCopyLink(() => 'https://daily.dev'));

  await act(async () => {
    await result.current[1]();
  });

  expect(mockWriteText).toHaveBeenCalledWith('https://daily.dev');
  expect(mockDisplayToast).toHaveBeenCalledWith(
    '✅ Copied link to clipboard',
    {},
  );
  expect(result.current[0]).toBe(true);
});

it('says so when the clipboard refuses the write', async () => {
  mockWriteText.mockRejectedValue(
    new DOMException('Document is not focused.', 'NotAllowedError'),
  );
  const { result } = renderHook(() => useCopyLink(() => 'https://daily.dev'));

  await act(async () => {
    await result.current[1]();
  });

  expect(mockDisplayToast).toHaveBeenCalledWith(
    '❌ Could not copy, please try again',
    {},
  );
  // Nothing was copied, so the caller must not render a copied confirmation.
  expect(result.current[0]).toBe(false);
});

it('does not report a copy when there is no link', async () => {
  const { result } = renderHook(() => useCopyLink(() => ''));

  await act(async () => {
    await result.current[1]();
  });

  expect(mockWriteText).not.toHaveBeenCalled();
  expect(mockDisplayToast).toHaveBeenCalledWith(
    '❌ Could not copy, link is missing',
    {},
  );
  expect(result.current[0]).toBe(false);
});
