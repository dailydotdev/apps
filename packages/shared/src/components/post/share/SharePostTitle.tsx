import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Markdown from '../../Markdown';

interface SharePostTitleProps {
  title?: string;
  titleHtml?: string;
  isCompactSpacing?: boolean;
}

export function SharePostTitle({
  title,
  titleHtml,
  isCompactSpacing,
}: SharePostTitleProps): ReactElement | null {
  if (!title) {
    return null;
  }

  const topMarginClassName = isCompactSpacing ? 'mt-4' : 'mt-6';

  if (!titleHtml) {
    return (
      <p
        className={classNames(
          topMarginClassName,
          'whitespace-pre-line break-words typo-title3',
        )}
      >
        {title}
      </p>
    );
  }

  return <Markdown className={topMarginClassName} content={titleHtml} />;
}
