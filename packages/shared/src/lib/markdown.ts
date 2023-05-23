import { CursorType, GetReplacementFn, isFalsyOrSpace } from './textarea';

const urlText = 'url';
const getUrlText = (content = '') => `[${content}](${urlText})`;

const charsToBrackets = 1;
export const getLinkReplacement: GetReplacementFn = (type, { word } = {}) => {
  const replacement = getUrlText(word);

  if (type === CursorType.Highlighted) {
    const base = replacement.length - 1;
    const start = base - urlText.length;
    const offset = [start, base];
    return { replacement, offset };
  }

  if (type === CursorType.Adjacent) {
    return { replacement, offset: [urlText.length, 1] };
  }

  const offset = replacement.length - charsToBrackets;

  return { replacement, offset: [offset] };
};

export const getMentionReplacement: GetReplacementFn = (
  type,
  { word = '', trailingChar } = {},
) => {
  const replacement = `@${word}`;

  if (type === CursorType.Isolated) return { replacement };

  if (type === CursorType.Adjacent) {
    if (word.charAt(0) === '@') return { replacement: `${word} @` };

    return { replacement };
  }

  const hasValidCharacter = isFalsyOrSpace(trailingChar);
  const offset = hasValidCharacter
    ? [1, replacement.length]
    : [2, replacement.length + 1];

  if (hasValidCharacter) {
    return { replacement, offset };
  }

  return { replacement: ` ${replacement}`, offset };
};
