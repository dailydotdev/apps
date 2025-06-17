import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Source } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import { Separator } from '../cards/common/common';
import type { ProfileImageSize } from '../ProfilePicture';
import { FollowButton } from '../contentPreference/FollowButton';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { SquadActionButton } from '../squads/SquadActionButton';
import { Origin } from '../../lib/log';
import { useSquad, useViewSize, ViewSize } from '../../hooks';
import { ButtonSize } from '../buttons/common';

interface SourceInfoProps {
  source: Source;
  date?: string;
  size?: ProfileImageSize;
  className?: string;
}

function PostSourceInfo({
  date,
  source,
  className,
}: SourceInfoProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileXL);
  const [showActionBtn, setShowActionBtn] = useState(false);
  const isUnknown = source.id === 'unknown';
  const { squad, isLoading: isLoadingSquad } = useSquad({
    handle: source.handle,
  });
  const { data, status } = useContentPreferenceStatusQuery({
    id: source.id,
    entity: ContentPreferenceType.Source,
  });

  useEffect(() => {
    if (isMobile && status === 'success' && !showActionBtn) {
      setShowActionBtn(
        ![
          ContentPreferenceStatus.Follow,
          ContentPreferenceStatus.Subscribed,
        ].includes(data?.status),
      );
    }
  }, [status, data?.status, showActionBtn, isMobile]);

  return (
    <span
      className={classNames(
        'flex flex-row items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      {!isUnknown && (
        <>
          <Link
            href={source.permalink}
            className="text-text-secondary typo-callout"
          >
            {source.handle}
          </Link>
          {showActionBtn && <Separator />}
          {showActionBtn && source?.type !== SourceType.Squad && (
            <FollowButton
              buttonClassName="!px-0 text-text-link btn-option min-w-min"
              entityId={source.id}
              status={data?.status}
              type={ContentPreferenceType.Source}
              entityName={source.name}
              showSubscribe={false}
            />
          )}
          {showActionBtn &&
            source?.type === SourceType.Squad &&
            !isLoadingSquad && (
              <SquadActionButton
                size={ButtonSize.XSmall}
                className={{
                  button: 'btn-option min-w-min !px-0 text-text-link',
                }}
                squad={squad}
                copy={{
                  join: 'Join',
                  leave: 'Leave',
                }}
                origin={Origin.PostContent}
                showViewSquadIfMember={false}
              />
            )}
        </>
      )}
      {!!date && (
        <>
          {!isUnknown && <Separator />}
          <time dateTime={date}>{date}</time>
        </>
      )}
    </span>
  );
}

export default PostSourceInfo;
