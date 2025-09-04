import type { MutableRefObject } from 'react';
import React from 'react';
import { search } from 'node-emoji';
import { BaseTooltip } from './BaseTooltip';

const RecommendedEmojiTooltip = ({
  textareaRef,
  emojis,
}: {
  textareaRef: MutableRefObject<HTMLElement>;
  emojis: string[];
}) => {
  const emojiData = search('hea');
  console.log(emojiData);
  return (
    <BaseTooltip appendTo={globalThis?.document?.body} reference={textareaRef}>
      <>
        <h1>hello</h1>
        <ul>
          {emojiData.map((emoji) => (
            <li key={emoji.name}>{emoji.emoji}</li>
          ))}
        </ul>
      </>
    </BaseTooltip>
  );
};

export default RecommendedEmojiTooltip;
