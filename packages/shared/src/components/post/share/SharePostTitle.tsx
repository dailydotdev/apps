import type { ReactElement } from 'react';
import React from 'react';
import Markdown from '../../Markdown';

interface SharePostTitleProps {
  title?: string;
  titleHtml?: string;
}

export function SharePostTitle({
  title,
  titleHtml,
}: SharePostTitleProps): ReactElement {
  if (!title) {
    return null;
  }

  if (!titleHtml) {
    return <p className="typo-title3 mt-6 whitespace-pre-line">{title}</p>;
  }

  return <Markdown className="mt-6" content={titleHtml} />;
}
