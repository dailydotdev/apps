import React, { ReactElement } from 'react';
import classNames from 'classnames';
import FeatherIcon from '../icons/Feather';
import { Author } from '../../graphql/comments';

interface PostAuthorProps {
  author: Author;
  className?: string;
}

export default function PostAuthor({
  author,
  className,
}: PostAuthorProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-row items-center font-bold typo-footnote text-theme-status-help',
        className,
      )}
    >
      <FeatherIcon secondary className="mr-1 text-xl" />
      <span className="truncate">{author.name}</span>
    </div>
  );
}
