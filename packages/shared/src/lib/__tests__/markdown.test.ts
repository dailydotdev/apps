import { isSelectionInMarkdownLink } from '../markdown';

// Mock HTMLTextAreaElement
const createMockTextarea = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
) => {
  return {
    value,
    selectionStart,
    selectionEnd,
  } as HTMLTextAreaElement;
};

describe('isSelectionInMarkdownLink', () => {
  test('should return true when selection is inside markdown link text', () => {
    const textarea = createMockTextarea(
      '[click here](https://example.com)',
      1,
      10,
    );
    const result = isSelectionInMarkdownLink(textarea, 1, 10);
    expect(result).toBe(true);
  });

  test('should return true when selection is inside markdown link URL', () => {
    const textarea = createMockTextarea(
      '[click here](https://example.com)',
      13,
      32,
    );
    const result = isSelectionInMarkdownLink(textarea, 13, 32);
    expect(result).toBe(true);
  });

  test('should return true when selection is in empty markdown link', () => {
    const textarea = createMockTextarea('[](url)', 1, 1);
    const result = isSelectionInMarkdownLink(textarea, 1, 1);
    expect(result).toBe(true);
  });

  test('should return false when selection is not in markdown link', () => {
    const textarea = createMockTextarea('This is regular text', 5, 10);
    const result = isSelectionInMarkdownLink(textarea, 5, 10);
    expect(result).toBe(false);
  });

  test('should return false when selection spans beyond markdown link', () => {
    const textarea = createMockTextarea(
      'Before [click here](https://example.com) after',
      0,
      20,
    );
    const result = isSelectionInMarkdownLink(textarea, 0, 20);
    expect(result).toBe(false);
  });

  test('should return false when markdown link is incomplete', () => {
    const textarea = createMockTextarea('[click here](', 1, 10);
    const result = isSelectionInMarkdownLink(textarea, 1, 10);
    expect(result).toBe(false);
  });

  test('should return false when there are newlines in between', () => {
    const textarea = createMockTextarea(
      '[click here\n](https://example.com)',
      1,
      10,
    );
    const result = isSelectionInMarkdownLink(textarea, 1, 10);
    expect(result).toBe(false);
  });

  test('should handle multiple markdown links on same line', () => {
    const textarea = createMockTextarea(
      '[first](url1) [second](url2)',
      15,
      21,
    );
    const result = isSelectionInMarkdownLink(textarea, 15, 21);
    expect(result).toBe(true);
  });
});
