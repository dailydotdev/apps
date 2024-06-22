import React, { ReactElement, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { Ad } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import { ProfileLink } from '../profile/ProfileLink';
import { TruncateText } from '../utilities';
import AdLink from '../cards/AdLink';
import { adLogEvent } from '../../lib/feed';
import LogContext from '../../contexts/LogContext';

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
    return <div>Loading...</div>;
  }

  const { hostname } = adsQuery?.data?.link
    ? new URL(adsQuery?.data?.link)
    : undefined;

  return (
    <div className="relative mt-6 rounded-24 border border-border-subtlest-tertiary p-4 hover:bg-surface-hover focus:outline">
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

      <ProfileImageLink
        className="!inline-block"
        user={{
          id: adsQuery?.data?.id,
          username: adsQuery?.data?.source,
          permalink: adsQuery?.data?.link,
          image: adsQuery?.data?.image,
        }}
      />
      <div className="ml-3 inline-block flex-col">
        <ProfileLink
          href={adsQuery?.data?.link}
          className={classNames(
            'commentAuthor w-fit font-bold text-text-primary typo-callout',
          )}
          title={hostname}
        >
          <TruncateText>{hostname}</TruncateText>
        </ProfileLink>
        <ProfileLink
          href={adsQuery?.data?.source}
          className={classNames('w-fit text-text-quaternary typo-callout')}
          title={adsQuery?.data?.source}
        >
          <TruncateText>Promoted by {adsQuery?.data?.source}</TruncateText>
        </ProfileLink>
      </div>
      <p className="mt-3 text-text-primary typo-body">
        {adsQuery?.data?.description}
      </p>
    </div>
  );
};
