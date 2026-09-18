import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type { Post } from '../../graphql/posts';
import {
  POST_TOPIC_SIGNUP_PREVIEW_COUNT,
  postTopicSignupQueryOptions,
} from '../../graphql/postTopicSignup';
import { tagTitlesQueryOptions } from '../../graphql/keywords';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { SignupWidget } from '../auth/SignupWidget';
import Link from '../utilities/Link';

interface PostTopicSignupProps {
  post: Post;
  tag: string;
  className?: string;
}

export function PostTopicSignup({
  post,
  tag,
  className,
}: PostTopicSignupProps): ReactElement {
  const { tokenRefreshed } = useAuthContext();
  const { logEvent } = useLogContext();
  const [ref, inView] = useInView({ triggerOnce: true });
  const enabled = tokenRefreshed && inView;
  const { data: titles } = useQuery({
    ...tagTitlesQueryOptions(),
    enabled,
  });
  const { data } = useQuery({
    ...postTopicSignupQueryOptions(post.id, tag),
    enabled,
  });
  const topic = titles?.[tag] || `#${tag}`;
  const previews = (data?.similarPosts ?? [])
    .filter(
      (preview, index, posts) =>
        preview.id !== post.id &&
        posts.findIndex(({ id }) => id === preview.id) === index,
    )
    .slice(0, POST_TOPIC_SIGNUP_PREVIEW_COUNT);
  const extra = JSON.stringify({ origin: 'post topic signup', tag });

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.PostTopicSignup,
      target_id: post.id,
      extra,
    }),
    { condition: inView },
  );

  return (
    <div ref={ref} className={className}>
      <SignupWidget
        title={`Get more posts about ${topic}`}
        description="Create a free account to follow the topics you care about and build your own developer feed."
        trigger={AuthTriggers.PostPage}
      >
        {previews.length > 0 && (
          <ul
            aria-label={`More posts about ${topic}`}
            className="mt-4 flex flex-col gap-3"
          >
            {previews.map((preview) => (
              <li key={preview.id}>
                <Link
                  href={preview.commentsPermalink}
                  passHref
                  prefetch={false}
                >
                  <a
                    href={preview.commentsPermalink}
                    className="block rounded-8 border border-border-subtlest-tertiary p-3 hover:bg-surface-hover"
                    onClick={() =>
                      logEvent({
                        event_name: LogEvent.Click,
                        target_type: TargetType.Post,
                        target_id: preview.id,
                        extra,
                      })
                    }
                  >
                    <span className="line-clamp-2 font-bold text-text-primary typo-callout">
                      {preview.title}
                    </span>
                    {preview.source?.name && (
                      <span className="mt-1 block text-text-tertiary typo-caption1">
                        {preview.source.name}
                      </span>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SignupWidget>
    </div>
  );
}
