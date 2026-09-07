import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import { formatDataTileValue } from '../../lib/numberFormat';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];
const CHIP_BORDER = 'rgba(255, 255, 255, 0.16)';

/** The thumbnail keeps the post page's proportions beside the headline. */
const THUMBNAIL_WIDTH = 276;
const THUMBNAIL_HEIGHT = 155;

/** A long headline steps down rather than crowding the thumbnail. */
const titleFontSize = (length: number): number => {
  if (length <= 48) {
    return 62;
  }

  if (length <= 90) {
    return 54;
  }

  return 46;
};

const Chip = ({ label }: { label: string }): ReactElement => (
  <span
    style={{
      color: MUTED,
      fontSize: 24,
      lineHeight: 1,
      padding: '14px 20px',
      borderRadius: 999,
      border: `1px solid ${CHIP_BORDER}`,
    }}
  >
    {label}
  </span>
);

const Stat = ({
  value,
  label,
}: {
  value: number;
  label: string;
}): ReactElement => (
  <span style={{ fontSize: 28 }}>
    <span className="font-bold text-white">{formatDataTileValue(value)}</span>
    <span style={{ color: MUTED }}> {label}</span>
  </span>
);

interface PostSnapshotCardProps {
  post: Post;
  seed?: string;
}

/**
 * The post page itself, framed — not a summary of it. The CEO's note was that
 * a screenshot beat our export, so the card carries what the page carries:
 * the source with its follow affordance, the headline beside its thumbnail,
 * the whole TLDR, the tags and the engagement. Only the page's own controls
 * are dropped, since a still image has nothing to press.
 */
function PostSnapshotCardComponent(
  { post, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const title = post.title ?? '';
  const meta = [
    post.createdAt &&
      formatDate({ value: post.createdAt, type: TimeFormatType.Post }),
    post.readTime && `${post.readTime}m read time`,
    post.domain && `From ${post.domain}`,
  ].filter(Boolean) as string[];
  const tags = post.tags?.slice(0, 3) ?? [];
  const impressions = post.analytics?.impressions;

  return (
    // wide + grow: the article gets the room, not the margin around it.
    <SnapshotFrame grow wide ref={ref} seed={seed ?? post.id}>
      <div className="flex flex-1 flex-col gap-7">
        {post.source?.name && (
          <div className="flex items-center gap-4">
            {post.source.image && (
              <img
                src={post.source.image}
                alt=""
                crossOrigin="anonymous"
                className="block size-16 rounded-full object-cover"
              />
            )}
            <span
              className="font-bold text-white"
              style={{ fontSize: 30, lineHeight: 1.2 }}
            >
              {post.source.name}
            </span>
            <Chip label="Follow" />
          </div>
        )}

        <div className="flex items-start gap-6">
          <h1
            className="snapshot-copy flex-1 font-bold text-white"
            style={{
              fontSize: titleFontSize(title.length),
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>
          {post.image && (
            <img
              src={post.image}
              alt=""
              crossOrigin="anonymous"
              className="block shrink-0 rounded-16 object-cover"
              style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
            />
          )}
        </div>

        {meta.length > 0 && (
          <span style={{ color: MUTED, fontSize: 27, lineHeight: 1.3 }}>
            {meta.join(' · ')}
          </span>
        )}

        {post.summary && (
          <p
            className="snapshot-copy"
            style={{ color: MUTED, fontSize: 33, lineHeight: 1.5 }}
          >
            {post.summary}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-3">
            {tags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} />
            ))}
          </div>
        )}

        {(post.numUpvotes || post.numComments || impressions) && (
          <div
            className={`flex flex-wrap items-center gap-6 ${
              tags.length ? '' : 'mt-auto'
            }`}
            style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}
          >
            {!!post.numUpvotes && (
              <Stat label="Upvotes" value={post.numUpvotes} />
            )}
            {!!post.numComments && (
              <Stat label="Comments" value={post.numComments} />
            )}
            {!!impressions && <Stat label="Impressions" value={impressions} />}
          </div>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
