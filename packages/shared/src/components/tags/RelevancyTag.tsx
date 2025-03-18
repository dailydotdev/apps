import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Typography, TypographyType } from '../typography/Typography';
import { BlockIcon, VIcon } from '../icons';

const RelevancyTag = ({ relevant }: { relevant?: boolean }): ReactElement => {
  return (
    <div
      className={classNames(
        'flex items-center gap-1 rounded-8 px-2 py-1',
        relevant
          ? 'bg-action-upvote-float text-action-upvote-default'
          : 'bg-action-downvote-float text-action-downvote-default',
      )}
    >
      <Typography type={TypographyType.Caption1}>
        {relevant ? 'Relevant' : 'Irrelevant'}
      </Typography>
      {relevant ? <VIcon /> : <BlockIcon />}
    </div>
  );
};

export default RelevancyTag;
