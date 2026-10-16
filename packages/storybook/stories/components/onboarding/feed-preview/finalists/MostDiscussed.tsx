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
import {
  DiscussIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { usePreviewFeed } from '../previewData';
import { MatchedTag } from '../PreviewKit';
import type { DiscussedPost, DiscussionPerson } from './discussedPosts.fixture';
import {
  DISCUSSED_IDS_BY_TAG,
  DISCUSSED_POSTS,
} from './discussedPosts.fixture';

const FIRST_PAGE = 3;
const PAGE = 3;
const MAX_POSTS = 9;
const FACES = 5;

const postsById = new Map(DISCUSSED_POSTS.map((post) => [post.id, post]));

interface Discussion {
  post: DiscussedPost;
  tag: string;
}

// Newest pick first, then round-robin, so each pick brings a discussion of
// its own near the top. Ordered by comments within a tag.
const getDiscussions = (tags: string[]): Discussion[] => {
  const queues = tags.map((tag) => [...(DISCUSSED_IDS_BY_TAG[tag] ?? [])]);
  const seen = new Set<string>();
  const result: Discussion[] = [];

  while (queues.some((queue) => queue.length)) {
    queues.forEach((queue, index) => {
      const id = queue.shift();
      const post = id && postsById.get(id);

      if (post && !seen.has(id)) {
        seen.add(id);
        result.push({ post, tag: tags[index] });
      }
    });
  }

  return result;
};

const getFaces = (post: DiscussedPost): DiscussionPerson[] => {
  const people = [
    ...post.topComments.map(({ author }) => author),
    ...post.upvoters,
  ];

  return people
    .filter(
      (person, index) =>
        people.findIndex(({ id }) => id === person.id) === index,
    )
    .slice(0, FACES);
};

const getDiscussing = (post: DiscussedPost): string => {
  const [first] = post.topComments;
  const others = (post.numComments ?? 0) - 1;

  if (!first) {
    return `${post.numUpvotes} developers upvoted this`;
  }

  return others > 0
    ? `${first.author.name} and ${others} ${
        others === 1 ? 'other' : 'others'
      } are discussing this`
    : `${first.author.name} is discussing this`;
};

const Faces = ({ people }: { people: DiscussionPerson[] }): ReactElement => (
  <span className="flex shrink-0 items-center">
    {people.map((person, index) => (
      <Image
        key={person.id}
        alt={person.name}
        className={classNames(
          'size-7 rounded-max border-2 border-background-default object-cover',
          index > 0 && '-ml-2',
        )}
        src={person.image}
        style={{ zIndex: FACES - index }}
        type={ImageType.Avatar}
      />
    ))}
  </span>
);

const DiscussionCard = ({ post, tag }: Discussion): ReactElement => {
  const [topComment] = post.topComments;

  return (
    <article className="flex animate-composer-in flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-center gap-1.5 text-text-tertiary typo-footnote">
            <SourceAvatar
              className="!mr-0"
              size={ProfileImageSize.Size16}
              source={post.source as Source}
            />
            <span className="truncate">{post.source?.name}</span>
            <MatchedTag tag={tag} />
          </span>
          <h3 className="line-clamp-2 font-bold text-text-primary typo-callout">
            {post.title}
          </h3>
        </div>
        <Image
          alt=""
          className="size-14 shrink-0 rounded-12 object-cover"
          src={post.image}
          type={ImageType.Post}
        />
      </div>
      {topComment && (
        <figure className="flex gap-2.5 rounded-12 bg-surface-float p-3">
          <Image
            alt=""
            className="size-6 shrink-0 rounded-max object-cover"
            src={topComment.author.image}
            type={ImageType.Avatar}
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <figcaption className="font-bold text-text-primary typo-footnote">
              {topComment.author.name}
            </figcaption>
            <blockquote className="line-clamp-2 text-text-secondary typo-footnote">
              {topComment.content}
            </blockquote>
          </span>
        </figure>
      )}
      <div className="flex items-center gap-2">
        <Faces people={getFaces(post)} />
        <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
          {getDiscussing(post)}
        </span>
      </div>
      <div className="flex gap-2">
        <span className="flex items-center gap-1.5 rounded-10 bg-surface-float px-2.5 py-1 font-bold text-text-primary typo-callout tabular-nums">
          <DiscussIcon className="text-accent-blueCheese-default" />
          {largeNumberFormat(post.numComments ?? 0)}
          <span className="font-normal text-text-tertiary typo-footnote">
            comments
          </span>
        </span>
        <span className="flex items-center gap-1.5 rounded-10 bg-surface-float px-2.5 py-1 font-bold text-text-primary typo-callout tabular-nums">
          <UpvoteIcon className="text-accent-avocado-default" />
          {largeNumberFormat(post.numUpvotes ?? 0)}
          <span className="font-normal text-text-tertiary typo-footnote">
            upvotes
          </span>
        </span>
      </div>
    </article>
  );
};

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
        <section className="flex w-full max-w-[27.5rem] flex-col gap-3">
          <div className="flex flex-col">
            <h2 className="flex items-center gap-1.5 font-bold text-text-primary typo-body">
              <DiscussIcon className="text-accent-blueCheese-default" />
              Most discussed in your interests
            </h2>
            <p className="text-text-tertiary typo-footnote">
              What developers are talking about this week.
            </p>
          </div>
          {visible.map((discussion) => (
            <DiscussionCard key={discussion.post.id} {...discussion} />
          ))}
          {canShowMore ? (
            <Button
              className="self-center"
              onClick={() => setShown((value) => value + PAGE)}
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
            >
              Show more discussions
            </Button>
          ) : (
            <p className="text-center text-text-tertiary typo-footnote">
              Join the conversation after this step.
            </p>
          )}
        </section>
      )}
    </TagStepFrame>
  );
};
