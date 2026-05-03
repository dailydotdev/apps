import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SharedPost } from '../../../graphql/posts';
import { ProfileImageSize } from '../../ProfilePicture';
import { SourceAvatar } from '../../profile/source/SourceAvatar';
import { Separator } from '../../cards/common/common';
import { DateFormat } from '../../utilities';
import { TimeFormatType } from '../../../lib/dateFormat';

export type ReadTimeUnit = 'read' | 'watch';

interface SharedPostMetaInfoProps {
  sharedPost: SharedPost;
  readTimeUnit?: ReadTimeUnit;
}

export const SharedPostMetaInfo = ({
  sharedPost,
  readTimeUnit = 'read',
}: SharedPostMetaInfoProps): ReactElement => {
  const sharedPostSource = sharedPost.source;
  const sourceName = sharedPostSource?.name;
  const hasNamedSource =
    !!sourceName && sourceName.toLowerCase() !== 'unknown';
  const readTimeLabel = readTimeUnit === 'watch' ? 'watch time' : 'read time';

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-text-tertiary typo-footnote">
      {hasNamedSource && sharedPostSource && (
        <SourceAvatar
          source={sharedPostSource}
          size={ProfileImageSize.XSmall}
          className="!mr-0"
        />
      )}
      {hasNamedSource && (
        <span className="font-medium text-text-secondary">{sourceName}</span>
      )}
      {sharedPost.domain && (
        // When a named source is present, hide "From {domain}" on mobile to
        // keep the meta line uncluttered. `display: contents` keeps the
        // children as direct flex items of the parent on tablet+.
        <span
          className={classNames(
            'contents',
            hasNamedSource && 'hidden tablet:contents',
          )}
        >
          {hasNamedSource && <Separator />}
          <span>From {sharedPost.domain}</span>
        </span>
      )}
      {sharedPost.createdAt && (
        <>
          <Separator />
          <DateFormat
            date={sharedPost.createdAt}
            type={TimeFormatType.Post}
          />
        </>
      )}
      {!!sharedPost.readTime && (
        <>
          <Separator />
          <span>
            {sharedPost.readTime}m {readTimeLabel}
          </span>
        </>
      )}
    </div>
  );
};
