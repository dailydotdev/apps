import React from 'react';
import isAfter from 'date-fns/isAfter';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Separator } from './common';
import type { Post } from '../../../graphql/posts';
import { largeNumberFormat } from '../../../lib';

const MIN_VOTES_REQUIRED = 10;

export type PollMetadataProps = Pick<Post, 'endsAt' | 'numPollVotes'> & {
  isAuthor: boolean;
};

const PollMetadata = ({
  endsAt,
  isAuthor,
  numPollVotes,
}: PollMetadataProps) => {
  const shouldShowVotes = numPollVotes > MIN_VOTES_REQUIRED || isAuthor;
  const pollHasEnded = endsAt && isAfter(new Date(), new Date(endsAt));

  return (
    <>
      {pollHasEnded && (
        <>
          <Typography tag={TypographyTag.Span} type={TypographyType.Footnote}>
            Voting ended
          </Typography>
          <Separator />
        </>
      )}
      <>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.StatusSuccess}
        >
          {shouldShowVotes ? 'Voting open' : 'New poll'}
        </Typography>
        <Separator />
      </>
      {shouldShowVotes && (
        <>
          <Typography tag={TypographyTag.Span} type={TypographyType.Footnote}>
            {largeNumberFormat(numPollVotes)}{' '}
            {pollHasEnded ? 'total votes' : 'votes'}
          </Typography>
          <Separator />
        </>
      )}
    </>
  );
};

export default PollMetadata;
