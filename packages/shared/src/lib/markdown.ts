import type { GetReplacementFn } from './textarea';
import { CursorType, isFalsyOrSpace } from './textarea';

const urlText = 'url';
const getUrlText = (content = '', url = urlText) => `[${content}](${url})`;

export const getLinkReplacement: GetReplacementFn = (
  type,
  { word, url, selection: [start] },
) => {
  const urlReplacement = url ?? urlText;
  const replacement = getUrlText(word, urlReplacement);

  if (type === CursorType.Isolated) {
    const offset = start + 1;
    return { replacement, offset: [offset, offset] };
  }

  const end = start + replacement.length - 1;
  return { replacement, offset: [end - urlReplacement.length, end] };
};

export const getStyleReplacement = (wrapper: string): GetReplacementFn => {
  return (type: CursorType, { word, selection: [start] }) => {
    const replacement = `${wrapper}${word}${wrapper}`;

    if (type === CursorType.Isolated) {
      const offset = start + wrapper.length;
      return { replacement, offset: [offset, offset] };
    }

    return { replacement };
  };
};

export const getMentionReplacement: GetReplacementFn = (
  type,
  { word, trailingChar, leadingChar, selection: [start] },
) => {
  const replacement = `@${word.trim()}`;

  if (type === CursorType.Isolated) {
    return { replacement };
  }

  if (type === CursorType.Adjacent) {
    if (word.charAt(0) === '@') {
      return { replacement: `${word} @` };
    }

    return { replacement };
  }

  const hasValidTrail = isFalsyOrSpace(trailingChar);
  const hasValidLead = isFalsyOrSpace(leadingChar);
  const startOffset = start + (hasValidTrail ? 1 : 2);
  const endOffset = startOffset + replacement.length - (hasValidLead ? 0 : 1);
  const offset = [startOffset, endOffset];
  const left = hasValidTrail ? '' : ' ';
  const right = hasValidLead ? '' : ' ';
  const complete = `${left}${replacement}${right}`;

  return { replacement: complete, offset };
};
