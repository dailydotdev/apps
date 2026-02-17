import { ensureTrailingParagraphForImage } from './useImageUpload';

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
    } as Parameters<typeof ensureTrailingParagraphForImage>[0]);

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
    } as Parameters<typeof ensureTrailingParagraphForImage>[0]);

    expect(dispatch).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalledWith('end');
  });
});
