import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { Source } from '../../graphql/sources';
import SourceButton from './SourceButton';
import classed from '../../lib/classed';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ReadArticleButton } from './ReadArticleButton';
import { visibleOnGroupHover } from './common';
import { PostCardTests } from '../post/common';

interface PostFooterOverlayProps extends PostCardTests {
  className?: string;
  author?: Author;
  source: Source;
  postLink: string;
  insaneMode?: boolean;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
}

const Overlay = classed(
  'div',
  'absolute inset-0 bg-theme-bg-primary opacity-32',
);

export const PostFooterOverlay = ({
  className,
  source,
  author,
  postLink,
  insaneMode,
  onReadArticleClick,
  postModalByDefault,
  postEngagementNonClickable,
}: PostFooterOverlayProps): ReactElement => {
  return (
    <div className={classNames('flex flex-row p-2', className)}>
      <Overlay
        className={classNames(
          'z-1',
          insaneMode ? 'hidden tablet:flex' : 'flex',
          postEngagementNonClickable && visibleOnGroupHover,
        )}
      />
      <SourceButton source={source} />
      {author && (
        <ProfileTooltip link={{ href: author.permalink }} user={author}>
          <ProfileImageLink
            className="ml-2"
            user={author}
            picture={{ size: 'medium' }}
          />
        </ProfileTooltip>
      )}
      {(postModalByDefault || postEngagementNonClickable) && (
        <ReadArticleButton
          className={classNames(
            'ml-auto',
            insaneMode ? 'btn-tertiary tablet:btn-primary' : 'btn-primary',
            visibleOnGroupHover,
          )}
          href={postLink}
          onClick={onReadArticleClick}
        />
      )}
    </div>
  );
};
