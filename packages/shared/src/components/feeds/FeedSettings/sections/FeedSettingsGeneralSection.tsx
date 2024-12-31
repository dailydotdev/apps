import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { Button } from '../../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../buttons/common';
import { IconSize } from '../../../Icon';
import {
  HashtagIcon,
  LockIcon,
  StarIcon,
  TrashIcon,
  VIcon,
} from '../../../icons';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../../../typography/Typography';
import { emojiOptions, webappUrl } from '../../../../lib/constants';
import { TextField } from '../../../fields/TextField';
import { Divider } from '../../../utilities';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { ColorName } from '../../../../styles/colors';
import useProfileForm from '../../../../hooks/useProfileForm';
import { FeedType } from '../../../../graphql/feed';
import { SimpleTooltip } from '../../../tooltips';
import { usePlusSubscription } from '../../../../hooks';

export const FeedSettingsGeneralSection = (): ReactElement => {
  const { setData, data, feed, onDelete } = useContext(FeedSettingsEditContext);
  const { user } = useAuthContext();
  const { updateUserProfile } = useProfileForm();
  const isMainFeed = feed?.type === FeedType.Main;
  const isCustomFeed = feed?.type === FeedType.Custom;
  const { isPlus, showPlusSubscription } = usePlusSubscription();

  const isDefaultFeed = isMainFeed
    ? user.defaultFeedId === null
    : user.defaultFeedId === feed.id;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Feed name
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {isMainFeed && isPlus ? (
              <span>
                Want a custom feed name? You can always{' '}
                <Link className="underline" href={`${webappUrl}feeds/new`}>
                  create
                </Link>{' '}
                a custom feed!
              </span>
            ) : (
              'Choose a name that reflects the focus of your feed.'
            )}
          </Typography>
        </div>
        {isMainFeed && (
          <TextField
            className={{
              container:
                'pointer-events-none w-full text-text-quaternary tablet:max-w-70',
            }}
            defaultValue={feed.flags?.name}
            name="name"
            type="text"
            inputId="feedName"
            label="My feed"
            rightIcon={<LockIcon />}
            disabled
            readOnly
          />
        )}
        {isCustomFeed && (
          <TextField
            className={{
              container: 'w-full tablet:max-w-70',
            }}
            defaultValue={feed.flags?.name}
            name="name"
            type="text"
            inputId="feedName"
            label="Enter feed name"
            required
            maxLength={50}
            valueChanged={(value) => setData({ name: value })}
          />
        )}
      </div>
      {isCustomFeed && showPlusSubscription && (
        <div className="flex flex-col gap-4">
          <Typography bold type={TypographyType.Body}>
            Choose an icon
          </Typography>
          <ul className="flex flex-wrap gap-4" role="radiogroup">
            {emojiOptions.map((emoji) => (
              <Button
                type="button"
                key={emoji}
                onClick={() => setData({ icon: emoji })}
                className={classNames(
                  '!size-12',
                  data.icon === emoji && 'border-surface-focus',
                )}
                variant={ButtonVariant.Float}
                aria-checked={
                  data.icon === emoji || (!emoji && data.icon === '')
                }
                role="radio"
              >
                {!emoji ? (
                  <HashtagIcon size={IconSize.Large} />
                ) : (
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Title1}
                  >
                    {emoji}
                  </Typography>
                )}
              </Button>
            ))}
          </ul>
        </div>
      )}
      {showPlusSubscription && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Body}>
              Set as your default feed
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Make this feed the first one you see every time you open
              daily.dev.
            </Typography>
          </div>
          {isCustomFeed && (
            <Button
              className={classNames(isDefaultFeed ? 'w-44' : 'w-40')}
              type="button"
              pressed
              size={ButtonSize.Small}
              color={isDefaultFeed ? ColorName.Avocado : undefined}
              variant={
                isDefaultFeed ? ButtonVariant.Tertiary : ButtonVariant.Secondary
              }
              disabled={!isPlus}
              icon={isDefaultFeed ? <VIcon /> : <StarIcon />}
              onClick={async () =>
                await updateUserProfile({
                  defaultFeedId: isDefaultFeed ? null : feed.id,
                })
              }
            >
              {isDefaultFeed ? 'Default feed set' : 'Make default'}
            </Button>
          )}
          {isMainFeed && (
            <SimpleTooltip
              disabled={!isDefaultFeed}
              content="Your main feed is already your default feed"
              placement="bottom"
            >
              <div className={classNames(isDefaultFeed ? 'w-44' : 'w-40')}>
                <Button
                  type="button"
                  pressed
                  size={ButtonSize.Small}
                  color={isDefaultFeed ? ColorName.Avocado : undefined}
                  variant={
                    user.defaultFeedId === null
                      ? ButtonVariant.Tertiary
                      : ButtonVariant.Secondary
                  }
                  icon={isDefaultFeed ? <VIcon /> : <StarIcon />}
                  disabled={user.defaultFeedId === null}
                  onClick={async () => {
                    updateUserProfile({
                      defaultFeedId: null,
                    });
                  }}
                >
                  {isDefaultFeed ? 'Default feed set' : 'Make default'}
                </Button>
              </div>
            </SimpleTooltip>
          )}
        </div>
      )}
      {isCustomFeed && (
        <>
          <Divider className="my-1 bg-border-subtlest-tertiary" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Typography bold type={TypographyType.Body}>
                Delete feed
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Permanently remove this feed and all its settings. This action
                cannot be undone.
              </Typography>
            </div>
            <Button
              className="w-40"
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<TrashIcon />}
              onClick={onDelete}
            >
              Delete feed
            </Button>
          </div>
        </>
      )}
    </>
  );
};
