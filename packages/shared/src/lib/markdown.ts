import { CursorType, GetReplacementFn, isFalsyOrSpace } from './textarea';

const urlText = 'url';
const getUrlText = (content = '') => `[${content}](${urlText})`;

export const getLinkReplacement: GetReplacementFn = (
  type,
  { word, selection: [start] },
) => {
  const replacement = getUrlText(word);

  if (type === CursorType.Isolated) {
    const offset = start + 1;
    return { replacement, offset: [offset, offset] };
  }

  const end = start + replacement.length - 1;
  return { replacement, offset: [end - urlText.length, end] };
};

export const getMentionReplacement: GetReplacementFn = (
  type,
  { word, trailingChar, selection: [start] },
) => {
  const replacement = `@${word}`;

  if (type === CursorType.Isolated) return { replacement };

  if (type === CursorType.Adjacent) {
    if (word.charAt(0) === '@') return { replacement: `${word} @` };

    return { replacement };
  }

  const hasValidCharacter = isFalsyOrSpace(trailingChar);
  const startOffset = start + (hasValidCharacter ? 1 : 2);
  const endOffset = startOffset + replacement.length;
  const offset = [startOffset, endOffset];

  if (hasValidCharacter) {
    return { replacement, offset };
  }

  return { replacement: ` ${replacement}`, offset };
};
