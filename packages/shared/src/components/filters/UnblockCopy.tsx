import React, { ReactElement } from 'react';
import { Tag } from '../../graphql/feedSettings';

export type CopyProps = {
  name: string | Tag;
};

export const UnblockTagCopy = ({ name }: CopyProps): ReactElement => {
  const tag = typeof name === 'string' ? name : name.name;
  const copy = `#${tag}`;

  return (
    <p>
      Unblocking <strong className="text-text-primary">{copy}</strong> means
      that you might see posts containing this tag in your feed.
    </p>
  );
};

export const UnblockSourceCopy = ({ name }: CopyProps): ReactElement => {
  const tag = typeof name === 'string' ? name : name.name;

  return (
    <p>
      Unblocking <strong className="text-text-primary">{tag}</strong> means that
      you might see posts from this source in your feed.
    </p>
  );
};
