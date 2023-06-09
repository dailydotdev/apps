import React, { ReactElement } from 'react';
import { defaultMarkdownCommands } from '../../../hooks/input';
import MarkdownInput from './index';

export interface CommentMarkdownInputProps {
  sourceId?: string;
  initialContent?: string;
}

export function CommentMarkdownInput({
  sourceId,
  initialContent,
}: CommentMarkdownInputProps): ReactElement {
  return (
    <MarkdownInput
      className={{ container: 'mt-4', tab: 'min-h-[16rem]' }}
      sourceId={sourceId}
      initialContent={initialContent}
      textareaProps={{ name: 'content', rows: 7 }}
      enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
      submitCopy="Comment"
    />
  );
}
