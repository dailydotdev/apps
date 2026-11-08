import { stripEmojisFromInput } from './useEmojiFreeInput';

describe('stripEmojisFromInput', () => {
  it('strips emojis in place and keeps the caret after the edit', () => {
    const input = document.createElement('textarea');
    input.value = 'Weekly 🏆 wins';
    input.setSelectionRange(9, 9);

    expect(stripEmojisFromInput(input)).toBe(true);
    expect(input.value).toBe('Weekly wins');
    expect(input.selectionStart).toBe(7);
  });

  it('leaves emoji-free input untouched', () => {
    const input = document.createElement('input');
    input.value = 'Weekly wins';
    input.setSelectionRange(3, 3);

    expect(stripEmojisFromInput(input)).toBe(false);
    expect(input.selectionStart).toBe(3);
  });
});
