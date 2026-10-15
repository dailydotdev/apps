import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { SendAirplaneIcon } from '@dailydotdev/shared/src/components/icons/SendAirplane';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { LfgIcon } from '../icons';
import { users } from '../data';
import type { Notif } from '../store';
import { findPost, NotifType, useProto } from '../store';
import { relativeDays } from '../ui';
import { PhoneHeader } from '../shell';

const NotifIcon = ({ notif }: { notif: Notif }): ReactElement => {
  if (notif.peerId && users[notif.peerId]) {
    return (
      <ProfilePicture
        user={users[notif.peerId]}
        size={ProfileImageSize.Large}
        nativeLazyLoading
      />
    );
  }
  const icon = {
    [NotifType.ReachOut]: <SendAirplaneIcon size={IconSize.Small} />,
    [NotifType.Accepted]: <VIcon size={IconSize.Small} />,
    [NotifType.Match]: <HashtagIcon size={IconSize.Small} />,
    [NotifType.Nudge]: <TimerIcon size={IconSize.Small} />,
    [NotifType.Filled]: <LfgIcon size={IconSize.Small} />,
    [NotifType.CheckIn]: <LfgIcon size={IconSize.Small} />,
    [NotifType.HelpMatch]: <VolunteeringIcon size={IconSize.Small} />,
    [NotifType.Launch]: <LfgIcon size={IconSize.Small} />,
  }[notif.type];
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-primary">
      {icon}
    </span>
  );
};

const NotifActions = ({ notif }: { notif: Notif }): ReactElement | null => {
  const { state, navigate, renewPost, endorse, track } = useProto();
  if (notif.type === NotifType.Nudge && notif.postId) {
    const post = findPost(state, notif.postId);
    if (post?.status !== 'open') {
      return null;
    }
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          onClick={() => navigate({ name: 'messages', tab: 'requests' })}
        >
          Review responses
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          onClick={() =>
            navigate({
              name: 'post',
              id: notif.postId as string,
              openFound: true,
            })
          }
        >
          Found someone
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          onClick={() => renewPost(notif.postId as string)}
        >
          Renew
        </Button>
      </div>
    );
  }
  if (notif.type === NotifType.CheckIn && notif.peerId) {
    if (state.endorsed) {
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.StatusSuccess}
        >
          Added &quot;Worked together&quot; to both profiles
        </Typography>
      );
    }
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XSmall}
          onClick={() => endorse(notif.peerId as string)}
        >
          Yes, we did
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          onClick={() => track('endorse')}
        >
          Not really
        </Button>
      </div>
    );
  }
  return null;
};

export const ActivityScreen = (): ReactElement => {
  const { state, navigate } = useProto();
  return (
    <>
      <PhoneHeader title="Activity" />
      <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-2 px-2 py-4 laptop:px-6 laptop:py-8">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title2}
          bold
          className="hidden px-2 pb-2 laptop:block"
        >
          Activity
        </Typography>
        {state.notifications.map((notif) => (
          <div
            key={notif.id}
            className={classNames(
              'flex items-start gap-3 rounded-16 px-3 py-3',
              notif.unread && 'bg-surface-float',
            )}
          >
            <NotifIcon notif={notif} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <button
                type="button"
                disabled={!notif.route}
                onClick={() => notif.route && navigate(notif.route)}
                className="flex flex-col gap-0.5 text-left"
              >
                <Typography type={TypographyType.Callout} bold={notif.unread}>
                  {notif.title}
                </Typography>
                {notif.body && (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="line-clamp-2"
                  >
                    {notif.body}
                  </Typography>
                )}
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {relativeDays(notif.at)}
                </Typography>
              </button>
              <NotifActions notif={notif} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
