import React, { ReactElement } from 'react';
import { Tag } from '../../graphql/feedSettings';

export type CopyProps = {
  name: string | Tag;
};

export const UnblockTagCopy = ({ name }: CopyProps): ReactElement => {
  return (
    <p>
      Unblocking <strong className="text-white">#{name}</strong> means that you
      might see posts containing this tag in your feed.
    </p>
  );
};

export const UnblockSourceCopy = ({ name }: CopyProps): ReactElement => {
  return (
    <p>
      Unblocking <strong className="text-white">{name}</strong> means that you
      might see posts from this source in your feed.
    </p>
  );
};
