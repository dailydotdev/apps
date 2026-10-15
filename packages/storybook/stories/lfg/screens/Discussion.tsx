import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { ReputationUserBadge } from '@dailydotdev/shared/src/components/ReputationUserBadge';
import { discussionComments, discussionTitle } from '../data';
import { isLooking, useProto, userFor } from '../store';
import { LfgAvatar } from '../ui';
import { PhoneHeader } from '../shell';
import { UserHover } from './UserHover';

// A post's comment section, laid out like CommentContainer, to show where the
// badge travels with someone who is looking.
export const DiscussionScreen = (): ReactElement => {
  const { state, navigate } = useProto();

  return (
    <>
      <PhoneHeader title="Post" />
      <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-6 px-4 py-6 laptop:px-6 laptop:py-8">
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Article · 8 min read
          </Typography>
          <Typography tag={TypographyTag.H1} type={TypographyType.Title2} bold>
            {discussionTitle}
          </Typography>
        </div>
        <Typography type={TypographyType.Body} bold>
          {discussionComments.length} comments
        </Typography>
        <div className="flex flex-col">
          {discussionComments.map((comment) => {
            const author = userFor(state, comment.authorId);
            return (
              <article
                key={comment.id}
                className="flex flex-col border-b border-border-subtlest-tertiary py-4"
              >
                <header className="flex w-full flex-row">
                  <UserHover user={author}>
                    <LfgAvatar
                      user={author}
                      size={ProfileImageSize.Large}
                      looking={isLooking(state, author.id)}
                    />
                  </UserHover>
                  <div className="ml-3 flex min-w-0 flex-1 flex-col typo-callout">
                    <div className="flex h-5 items-center gap-1 text-text-quaternary">
                      <button
                        type="button"
                        className="truncate font-bold text-text-primary typo-callout"
                        onClick={() =>
                          navigate({ name: 'profile', userId: author.id })
                        }
                      >
                        {author.name}
                      </button>
                      <span className="truncate text-text-tertiary typo-footnote">
                        @{author.username}
                      </span>
                      <span className="typo-footnote">· {comment.age}</span>
                    </div>
                    <div className="flex gap-1">
                      <ReputationUserBadge user={author} disableTooltip />
                    </div>
                  </div>
                </header>
                <p className="mt-3 break-words text-text-primary typo-body">
                  {comment.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
};
