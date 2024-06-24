import React, { ReactElement, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ad } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import { TruncateText } from '../utilities';
import AdLink from '../cards/AdLink';
import { adLogEvent } from '../../lib/feed';
import LogContext from '../../contexts/LogContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import PlaceholderCommentList from './PlaceholderCommentList';

export const AdAsComment = (): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const ad = useQuery<Ad>(
    ['ads', 'post'],
    async () => {
      const res = await fetch(`${apiUrl}/v1/a/post`);
      const ads: Ad[] = await res.json();
      return ads[0];
    },
    {
      enabled: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const { isLoading, data, isSuccess, isError } = ad || {};
  const { link, providerId, source, image, description, pixel } = data || {};

  useEffect(() => {
    if (!isLoading && isSuccess && providerId) {
      logEvent(
        adLogEvent('impression', data, {
          extra: {
            origin: 'post page',
          },
        }),
      );
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, providerId, isSuccess]);

  if (isError) {
    return null;
  }
  if (isLoading) {
    return <PlaceholderCommentList placeholderAmount={1} />;
  }

  const { hostname } = link ? new URL(link) : { hostname: undefined };

  return (
    <div className="relative mt-6 flex flex-wrap rounded-24 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline">
      <AdLink
        ad={data}
        onLinkClick={() => {
          logEvent(
            adLogEvent('click', data, {
              extra: {
                origin: 'post page',
              },
            }),
          );
        }}
      />
      <ProfilePicture
        nativeLazyLoading
        className="!inline-block"
        size={ProfileImageSize.Large}
        user={{ id: providerId, username: source, image }}
      />
      <div className="ml-3 inline-block flex-col">
        <TruncateText className="commentAuthor flex w-fit font-bold text-text-primary typo-callout">
          {hostname}
        </TruncateText>
        <TruncateText className="flex w-fit text-text-quaternary typo-callout">
          Promoted by {source}
        </TruncateText>
      </div>
      <p className="mt-3 w-fit text-text-primary typo-body">{description}</p>
      {pixel?.map((item) => (
        <img
          src={item}
          key={item}
          data-testid="pixel"
          className="hidden h-0 w-0"
          alt="Pixel"
        />
      ))}
    </div>
  );
};
