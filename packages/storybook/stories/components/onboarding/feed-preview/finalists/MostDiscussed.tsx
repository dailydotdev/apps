import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { usePreviewFeed } from '../previewData';
import type { DiscussedPost, DiscussionPerson } from './discussedPosts.fixture';
import {
  DISCUSSED_IDS_BY_TAG,
  DISCUSSED_POSTS,
} from './discussedPosts.fixture';

const FIRST_PAGE = 3;
const PAGE = 3;
const MAX_POSTS = 9;
const FACES = 4;

const postsById = new Map(DISCUSSED_POSTS.map((post) => [post.id, post]));

// Newest pick first, then round-robin, so each pick brings a discussion of
// its own near the top. Ordered by comments within a tag.
const getDiscussions = (tags: string[]): DiscussedPost[] => {
  const queues = tags.map((tag) => [...(DISCUSSED_IDS_BY_TAG[tag] ?? [])]);
  const seen = new Set<string>();
  const result: DiscussedPost[] = [];

  while (queues.some((queue) => queue.length)) {
    queues.forEach((queue) => {
      const id = queue.shift();
      const post = id && postsById.get(id);

      if (post && !seen.has(id)) {
        seen.add(id);
        result.push(post);
      }
    });
  }

  return result;
};

const getFaces = (post: DiscussedPost): DiscussionPerson[] => {
  const people = [...post.commenters, ...post.upvoters];

  return people
    .filter(
      (person, index) =>
        people.findIndex(({ id }) => id === person.id) === index,
    )
    .slice(0, FACES);
};

const plural = (count: number, word: string) =>
  `${largeNumberFormat(count)} ${word}${count === 1 ? '' : 's'}`;

const DiscussionRow = ({ post }: { post: DiscussedPost }): ReactElement => (
  <article className="flex items-start gap-4 py-3">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex min-w-0 items-center gap-1.5 text-text-tertiary typo-footnote">
        <SourceAvatar
          className="!mr-0"
          size={ProfileImageSize.Size16}
          source={post.source as Source}
        />
        <span className="truncate">{post.source?.name}</span>
      </span>
      <h3 className="line-clamp-2 font-bold text-text-primary typo-callout">
        {post.title}
      </h3>
      <span className="flex min-w-0 items-center gap-2 text-text-tertiary typo-footnote">
        <span className="flex shrink-0 items-center">
          {getFaces(post).map((person, index) => (
            <Image
              key={person.id}
              alt=""
              className={classNames(
                'size-5 rounded-max border-2 border-background-default object-cover',
                index > 0 && '-ml-1.5',
              )}
              src={person.image}
              type={ImageType.Avatar}
            />
          ))}
        </span>
        <span className="truncate">
          {plural(post.numUpvotes ?? 0, 'upvote')} ·{' '}
          {plural(post.numComments ?? 0, 'comment')}
        </span>
      </span>
    </div>
    <Image
      alt=""
      className="h-16 w-24 shrink-0 rounded-12 object-cover"
      loading="lazy"
      src={post.image}
      type={ImageType.Post}
    />
  </article>
);

export const MostDiscussed = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { tags, isReady } = usePreviewFeed();
  const [shown, setShown] = useState(FIRST_PAGE);
  const discussions = useMemo(() => getDiscussions(tags), [tags]);
  const visible = discussions.slice(0, Math.min(shown, MAX_POSTS));
  const canShowMore = shown < MAX_POSTS && discussions.length > visible.length;

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      {isReady && (
        <section className="flex w-full max-w-[27.5rem] flex-col">
          <h2 className="font-bold text-text-primary typo-body">
            Example discussions from your topics
          </h2>
          <p className="text-text-tertiary typo-footnote">
            Stay up to date with developer news and what the community thinks of
            it.
          </p>
          <div className="mt-2 flex flex-col divide-y divide-border-subtlest-tertiary">
            {visible.map((post) => (
              <DiscussionRow key={post.id} post={post} />
            ))}
          </div>
          {canShowMore ? (
            <Button
              className="self-center"
              onClick={() => setShown((value) => value + PAGE)}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            >
              Show more
            </Button>
          ) : (
            <p className="pt-2 text-center text-text-tertiary typo-footnote">
              Join the conversation after this step.
            </p>
          )}
        </section>
      )}
    </TagStepFrame>
  );
};
