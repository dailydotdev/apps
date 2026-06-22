import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { GoogleCloudLogo } from './GoogleCloudLogo';
import { googleCloudLatestPost } from './content';
import { gcpCoverBg } from './brand';

type GoogleCloudBlogCardProps = {
  className?: string;
};

// First feed card: promotes the latest post from the Google Cloud blog.
// Mirrors a standard post card (source row → title → meta → cover) with a
// "Sponsored" treatment. The cover falls back to a brand gradient if the
// remote image fails to load, so the demo never shows a broken image.
export const GoogleCloudBlogCard = ({
  className,
}: GoogleCloudBlogCardProps): ReactElement => {
  const [imageFailed, setImageFailed] = useState(false);
  const { source, title, excerpt, url, image, date, readTime } =
    googleCloudLatestPost;

  return (
    <article
      className={classNames(
        'flex h-full min-h-card flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-0',
        className,
      )}
      data-testid="googleCloudBlogCard"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col no-underline"
      >
        <div className="mx-4 mt-4 flex h-8 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-default">
            <GoogleCloudLogo size={20} />
          </div>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
            className="min-w-0 flex-1 truncate"
          >
            {source}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="rounded-6 border border-border-subtlest-tertiary px-1.5 py-0.5"
          >
            Sponsored
          </Typography>
        </div>
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="mx-4 mt-3 line-clamp-3"
        >
          {title}
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="mx-4 mt-1 line-clamp-2"
        >
          {excerpt}
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mx-4 mt-2"
        >
          {date} · {readTime} min read
        </Typography>
        <div className="mx-4 mb-4 mt-3">
          {imageFailed ? (
            <div
              className="flex aspect-video w-full items-center justify-center rounded-12"
              style={{ background: gcpCoverBg }}
            >
              <GoogleCloudLogo size={48} />
            </div>
          ) : (
            <img
              src={image}
              alt={title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="aspect-video w-full rounded-12 object-cover"
            />
          )}
        </div>
      </a>
    </article>
  );
};
