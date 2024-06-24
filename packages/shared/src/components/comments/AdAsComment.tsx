import React, { ReactElement, useContext } from 'react';
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

  const adsQuery = useQuery<Ad>(
    ['ads', 'post'],
    async () => {
      const res = await fetch(`${apiUrl}/v1/a`);
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

  if (adsQuery.isLoading) {
    return <PlaceholderCommentList placeholderAmount={1} />;
  }

  const { hostname } = adsQuery?.data?.link
    ? new URL(adsQuery?.data?.link)
    : undefined;

  return (
    <div className="relative mt-6 flex flex-wrap rounded-24 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline">
      <AdLink
        ad={adsQuery?.data}
        onLinkClick={() => {
          logEvent(
            adLogEvent('click', adsQuery?.data, {
              // TODO: ADD THIS
            }),
          );
        }}
      />
      <ProfilePicture
        nativeLazyLoading
        className="!inline-block"
        size={ProfileImageSize.Large}
        user={{
          id: adsQuery?.data?.id,
          username: adsQuery?.data?.source,
          image: adsQuery?.data?.image,
        }}
      />
      <div className="ml-3 inline-block flex-col">
        <TruncateText className="commentAuthor flex w-fit font-bold text-text-primary typo-callout">
          {hostname}
        </TruncateText>
        <TruncateText className="flex w-fit text-text-quaternary typo-callout">
          Promoted by {adsQuery?.data?.source}
        </TruncateText>
      </div>
      <p className="mt-3 w-fit text-text-primary typo-body">
        {adsQuery?.data?.description}
      </p>
    </div>
  );
};
