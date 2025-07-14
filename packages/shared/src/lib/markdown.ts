import type { GetReplacementFn } from './textarea';
import { CursorType, isFalsyOrSpace } from './textarea';

const urlText = 'url';
const getUrlText = (content = '', url = urlText) => `[${content}](${url})`;

/**
 * Checks if the selected text is already within a markdown link structure
 * Returns true if the selection is inside a pattern like [text](url) or [](url)
 */
export const isSelectionInMarkdownLink = (
  textarea: HTMLTextAreaElement,
  selectionStart: number,
  selectionEnd: number,
): boolean => {
  const text = textarea.value;

  // Look backwards from selection start to find the structure
  let openBracketIndex = -1;
  let closeBracketIndex = -1;
  let openParenIndex = -1;

  for (let i = selectionStart - 1; i >= 0; i -= 1) {
    if (text[i] === '(' && openParenIndex === -1) {
      openParenIndex = i;
    } else if (text[i] === ']' && closeBracketIndex === -1) {
      closeBracketIndex = i;
    } else if (text[i] === '[' && openBracketIndex === -1) {
      openBracketIndex = i;
      break;
    }
    // If we hit a newline, stop looking
    if (text[i] === '\n') {
      break;
    }
  }

  // Look forward from selection end to find closing parenthesis
  let closeParenIndex = -1;
  let forwardCloseBracketIndex = -1;
  let forwardOpenParenIndex = -1;

  for (let i = selectionEnd; i < text.length; i += 1) {
    if (text[i] === ']' && forwardCloseBracketIndex === -1) {
      forwardCloseBracketIndex = i;
    } else if (
      text[i] === '(' &&
      forwardCloseBracketIndex !== -1 &&
      forwardOpenParenIndex === -1
    ) {
      forwardOpenParenIndex = i;
    } else if (text[i] === ')') {
      closeParenIndex = i;
      break;
    }
    // If we hit a newline, stop looking
    if (text[i] === '\n') {
      break;
    }
  }

  // Case 1: Selection is in the text part [text](url)
  if (
    openBracketIndex !== -1 &&
    forwardCloseBracketIndex !== -1 &&
    forwardOpenParenIndex !== -1 &&
    closeParenIndex !== -1
  ) {
    // Verify the brackets are adjacent: ](
    if (forwardCloseBracketIndex + 1 === forwardOpenParenIndex) {
      return true;
    }
  }

  // Case 2: Selection is in the URL part [text](url)
  if (
    openBracketIndex !== -1 &&
    closeBracketIndex !== -1 &&
    openParenIndex !== -1 &&
    closeParenIndex !== -1
  ) {
    // Verify the brackets are adjacent: ](
    if (closeBracketIndex + 1 === openParenIndex) {
      return true;
    }
  }

  return false;
};

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
