import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClientError } from 'graphql-request';
import { Modal } from '../../modals/common/Modal';

import type { CreateFeedProps } from '../../../hooks';
import {
  useActions,
  useFeeds,
  usePlusSubscription,
  useProgressAnimation,
  useToastNotification,
} from '../../../hooks';
import { emojiOptions, webappUrl } from '../../../lib/constants';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { TextField } from '../../fields/TextField';
import { IconSize } from '../../Icon';
import { HashtagIcon } from '../../icons';
import {
  Typography,
  TypographyType,
  TypographyTag,
} from '../../typography/Typography';
import { LogEvent } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { labels } from '../../../lib/labels';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import { useAuthContext } from '../../../contexts/AuthContext';
import { PlusUser } from '../../PlusUser';
import { ModalClose } from '../../modals/common/ModalClose';
import { ActionType } from '../../../graphql/actions';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import type { ContentPreferenceType } from '../../../graphql/contentPreference';

export const FeedSettingsCreate = (): ReactElement => {
  const [newFeedId] = useState(() => Date.now().toString());
  const { completeAction } = useActions();
  const { user } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { showPlusSubscription } = usePlusSubscription();
  const [data, setData] = useState<CreateFeedProps>(() => ({
    icon: '',
  }));
  const { createFeed } = useFeeds();
  const { follow } = useContentPreference({ showToastOnSuccess: false });

  const { onFinished, delayedRedirect, isAnimating } = useProgressAnimation({
    animationMs: 1000,
  });

  const { mutate: onSubmit, isPending: isSubmitPending } = useMutation({
    mutationFn: createFeed,
    onSuccess: async (newFeed) => {
      logEvent({
        event_name: LogEvent.CreateCustomFeed,
        target_id: newFeed.id,
      });

      queryClient.removeQueries({
        queryKey: getFeedSettingsQueryKey(user, newFeedId),
      });

      const entityId = router?.query?.entityId as string;
      const entityType = router?.query?.entityType as ContentPreferenceType;

      if (entityId && entityType) {
        await follow({
          id: entityId,
          entity: entityType,
          entityName: entityId,
          feedId: newFeed.id,
        });

        // go back to entity page that was followed
        router.back();

        return;
      }

      onFinished();
      delayedRedirect(`${webappUrl}feeds/${newFeed.id}?created=1`);
    },
    onError: (error) => {
      const clientErrors = (error as ClientError)?.response?.errors || [];

      if (
        clientErrors.some(
          (item) => item.message === labels.feed.error.feedLimit.api,
        )
      ) {
        displayToast(labels.feed.error.feedLimit.client);

        return;
      }

      if (
        clientErrors.some(
          (item) => item.message === labels.feed.error.feedNameInvalid.api,
        )
      ) {
        displayToast(labels.feed.error.feedNameInvalid.api);

        return;
      }

      displayToast(labels.error.generic);
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    completeAction(ActionType.CustomFeed);
  }, [completeAction, user]);

  const logStartEventRef = useRef(false);

  useEffect(() => {
    if (logStartEventRef.current) {
      return;
    }

    logStartEventRef.current = true;

    logEvent({
      event_name: LogEvent.StartCustomFeed,
    });
  }, [logEvent]);

  const onRequestClose = () => {
    router.replace(webappUrl);
  };

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSubmit(data);
        }}
      >
        <ModalClose className="top-2" onClick={onRequestClose} type="button" />
        <Modal.Header title="" showCloseButton={false}>
          <div className="hidden items-center gap-4 tablet:flex">
            <Typography
              className="tablet:typo-title3"
              type={TypographyType.Body}
              bold
            >
              New custom feed
            </Typography>
            {showPlusSubscription && <PlusUser />}
          </div>
          <div className="flex w-full items-center justify-between gap-2 tablet:hidden">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={onRequestClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size={ButtonSize.Medium}
              variant={ButtonVariant.Primary}
              loading={isSubmitPending || isAnimating}
              disabled={!data.name}
            >
              Create feed
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body className="flex flex-col gap-4">
          <div className="flex items-center gap-4 tablet:hidden">
            <Typography
              className="tablet:typo-title3"
              type={TypographyType.Body}
              bold
            >
              New custom feed
            </Typography>
            <PlusUser />
          </div>
          <TextField
            className={{
              container: 'w-full',
            }}
            name="name"
            type="text"
            inputId="feedName"
            label="Give your feed a name"
            required
            maxLength={50}
            valueChanged={(value) =>
              setData((current) => ({ ...current, name: value }))
            }
          />
          <div className="flex flex-col gap-4">
            <Typography type={TypographyType.Body}>
              <Typography className="inline-flex" bold>
                Choose an icon
              </Typography>{' '}
              (optional)
            </Typography>
            <ul className="flex flex-wrap gap-4" role="radiogroup">
              {emojiOptions.map((emoji) => (
                <Button
                  type="button"
                  key={emoji}
                  onClick={() =>
                    setData((current) => ({ ...current, icon: emoji }))
                  }
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
          <Button
            className="hidden tablet:flex"
            type="submit"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            loading={isSubmitPending || isAnimating}
            disabled={!data.name}
          >
            Create feed
          </Button>
        </Modal.Body>
      </form>
    </Modal>
  );
};
