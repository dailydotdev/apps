import React, { ReactElement, useContext } from 'react';
import Button from './buttons/Button';
import XIcon from '../icons/x.svg';
import classNames from 'classnames';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { BANNER_QUERY, BannerData } from '../graphql/banner';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import usePersistentState from '../hooks/usePersistentState';

export default function Banner(): ReactElement {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [lastSeen, setLastSeen] = usePersistentState(
    'lastSeenBanner',
    new Date(0),
  );
  const { data } = useQuery<BannerData>(
    ['banner', lastSeen.getTime()],
    () => request(`${apiUrl}/graphql`, BANNER_QUERY, { lastSeen }),
    {
      enabled: windowLoaded,
    },
  );

  if (!data?.banner) {
    return <></>;
  }

  const { banner } = data;
  return (
    <div
      className={classNames(
        'relative flex flex-col items-start py-3 pl-3 pr-12 typo-footnote laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0',
        banner.theme === 'title-bacon' && 'text-theme-label-bacon',
        banner.theme === 'gradient-bacon-onion'
          ? 'bg-theme-bg-bacon'
          : 'bg-theme-bg-primary',
      )}
    >
      <div>
        <strong>{banner.title}</strong>
        <span className="ml-0.5">{banner.subtitle}</span>
      </div>
      <Button
        tag="a"
        href={banner.url}
        buttonSize="xsmall"
        className={classNames(
          'mt-2 laptop:ml-4 laptop:mt-0',
          banner.theme === 'cta-bacon-onion'
            ? 'btn-primary-bacon'
            : 'btn-primary',
        )}
      >
        {banner.cta}
      </Button>
      <Button
        buttonSize="xsmall"
        className="absolute top-2 right-2 laptop:inset-y-0 laptop:my-auto btn-tertiary"
        icon={<XIcon />}
        onClick={() =>
          setLastSeen(new Date(new Date(banner.timestamp).getTime() + 60_000))
        }
      />
    </div>
  );
}
