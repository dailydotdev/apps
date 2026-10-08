import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { publishTimeRelativeShort } from '../../../lib/dateFormat';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { dmRequestsQueryOptions } from '../queries';
import { getMessagesUrl } from '../urls';

export const RequestList = ({
  activePeerId,
}: {
  activePeerId?: string;
}): ReactElement => {
  const { user } = useAuthContext();
  const {
    data: requests,
    isPending,
    isError,
    refetch,
  } = useQuery(dmRequestsQueryOptions(user));

  if (isError) {
    return (
      <FlexCol className="items-center gap-3 px-6 py-10 text-center">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Couldn&apos;t load your message requests.
        </Typography>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </FlexCol>
    );
  }

  if (isPending) {
    return (
      <FlexCol className="gap-2 px-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-12 bg-surface-float"
          />
        ))}
      </FlexCol>
    );
  }

  if (!requests?.length) {
    return (
      <FlexCol className="items-center gap-1 px-6 py-10 text-center">
        <Typography type={TypographyType.Callout} bold>
          No message requests
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          People you don&apos;t follow back land here first, so you decide who
          can message you.
        </Typography>
      </FlexCol>
    );
  }

  return (
    <nav aria-label="Message requests" className="flex flex-col gap-0.5 px-2">
      {requests.map(({ id, peer, requestMessage, createdAt }) => {
        const isActive = peer.id === activePeerId;

        return (
          <Link
            key={id}
            href={getMessagesUrl(peer.id, { requests: true })}
            passHref
          >
            <a
              aria-current={isActive ? 'page' : undefined}
              className={classNames(
                'flex items-center gap-3 rounded-12 px-3 py-2.5 transition-colors hover:bg-surface-hover',
                isActive && 'bg-surface-float',
              )}
            >
              <ProfilePicture
                user={peer}
                size={ProfileImageSize.Large}
                nativeLazyLoading
              />
              <FlexCol className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <Typography
                    type={TypographyType.Callout}
                    bold
                    truncate
                    className="flex-1"
                  >
                    {peer.name}
                  </Typography>
                  <Typography
                    tag={TypographyTag.Time}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="shrink-0"
                    dateTime={createdAt}
                  >
                    {publishTimeRelativeShort(createdAt)}
                  </Typography>
                </div>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  {requestMessage}
                </Typography>
              </FlexCol>
            </a>
          </Link>
        );
      })}
    </nav>
  );
};
