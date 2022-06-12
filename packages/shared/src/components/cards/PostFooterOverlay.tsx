import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Author } from '../../graphql/comments';
import { Source } from '../../graphql/sources';
import SourceButton from './SourceButton';
import classed from '../../lib/classed';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ReadArticleButton } from './ReadArticleButton';
import FeaturesContext from '../../contexts/FeaturesContext';

interface PostFooterOverlayProps {
  className?: string;
  author?: Author;
  source: Source;
  postLink: string;
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
}: PostFooterOverlayProps): ReactElement => {
  const { postModalByDefault, postEngagementNonClickable } =
    useContext(FeaturesContext);

  return (
    <div className={classNames('flex flex-row p-2', className)}>
      <Overlay />
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
            postEngagementNonClickable &&
              'laptop:mouse:invisible laptop:mouse:group-hover:visible',
          )}
          href={postLink}
        />
      )}
    </div>
  );
};
