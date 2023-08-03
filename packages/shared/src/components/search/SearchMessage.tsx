import React, { ReactElement } from 'react';
import { RenderMarkdown } from '../RenderMarkdown';

export type SearchMessageProps = {
  content: string;
};

export const SearchMessage = ({
  content,
}: SearchMessageProps): ReactElement => {
  return <RenderMarkdown content={content} />;
};
