import { renderHook } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import {
  UploadState,
  useSyncUploader,
} from '../../../hooks/input/useSyncUploader';
import {
  ensureTrailingParagraphForImage,
  useImageUpload,
} from './useImageUpload';

jest.mock('../../../hooks/input/useSyncUploader', () => ({
  ...jest.requireActual('../../../hooks/input/useSyncUploader'),
  useSyncUploader: jest.fn(),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

describe('ensureTrailingParagraphForImage', () => {
  it('should append a trailing paragraph when image is the last node', () => {
    const paragraphNode = { type: 'paragraph-node' };
    const createParagraph = jest.fn().mockReturnValue(paragraphNode);
    const insert = jest.fn().mockReturnValue('tr');
    const dispatch = jest.fn();
    const focus = jest.fn();

    ensureTrailingParagraphForImage({
      state: {
        doc: {
          lastChild: { type: { name: 'image' } },
          content: { size: 7 },
        },
        schema: {
          nodes: {
            paragraph: { create: createParagraph },
          },
        },
        tr: { insert },
      },
      view: { dispatch },
      commands: { focus },
    } as unknown as Parameters<typeof ensureTrailingParagraphForImage>[0]);

    expect(createParagraph).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(7, paragraphNode);
    expect(dispatch).toHaveBeenCalledWith('tr');
    expect(focus).toHaveBeenCalledWith('end');
  });

  it('should only focus when the last node is not an image', () => {
    const dispatch = jest.fn();
    const focus = jest.fn();

    ensureTrailingParagraphForImage({
      state: {
        doc: {
          lastChild: { type: { name: 'paragraph' } },
        },
      },
      view: { dispatch },
      commands: { focus },
    } as unknown as Parameters<typeof ensureTrailingParagraphForImage>[0]);

    expect(dispatch).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalledWith('end');
  });
});

it('reports the uploaded file and URL to the composer after inserting the image', () => {
  jest.mocked(useSyncUploader).mockReturnValue({
    uploadedCount: 0,
    queueCount: 0,
    pushUpload: jest.fn(),
    startUploading: jest.fn(),
  });
  const onImageUpload = jest.fn();
  const setImage = jest.fn().mockReturnValue({ run: jest.fn() });
  const editor = {
    chain: () => ({ focus: () => ({ setImage }) }),
    state: { doc: { lastChild: { type: { name: 'paragraph' } } } },
    commands: { focus: jest.fn() },
  } as unknown as Editor;
  renderHook(() =>
    useImageUpload({
      enabled: true,
      editorRef: { current: editor },
      onImageUpload,
    }),
  );
  const file = new File(['image'], 'screenshot.png', { type: 'image/png' });
  const url = 'https://media.daily.dev/screenshot.png';

  jest
    .mocked(useSyncUploader)
    .mock.calls[0][0].onFinish(UploadState.Ok, file, url);

  expect(setImage).toHaveBeenCalledWith({ src: url, alt: file.name });
  expect(onImageUpload).toHaveBeenCalledWith(file, url);
});
