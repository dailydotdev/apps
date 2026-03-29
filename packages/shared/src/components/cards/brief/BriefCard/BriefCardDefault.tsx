import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import {
  briefButtonBg,
} from '../../../../styles/custom';
import type { BriefCardProps } from './BriefCard';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import {
  BriefingType,
  getGenerateBriefingMutationOptions,
} from '../../../../graphql/posts';
import { useBriefContext } from '../BriefContext';
import { useActions, useToastNotification } from '../../../../hooks';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { ApiError, ApiErrorResult } from '../../../../graphql/common';
import CloseButton from '../../../CloseButton';
import { ActionType } from '../../../../graphql/actions';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../../lib/log';

export type BriefCardDefaultProps = BriefCardProps;

export const BriefCardDefault = ({
  className,
  title,
  children,
  showCloseButton = true,
  showBorder = true,
}: BriefCardDefaultProps): ReactElement => {
  const briefContext = useBriefContext();
  const { displayToast } = useToastNotification();
  const { completeAction } = useActions();
  const { logEvent } = useLogContext();

  const handleDismiss = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.BriefCard,
      target_id: 'dismiss',
    });
    completeAction(ActionType.DismissBriefCard);
  }, [logEvent, completeAction]);

  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { mutateAsync: generateBrief, isPending: isGenerating } = useMutation({
    ...getGenerateBriefingMutationOptions(),
    onSuccess: async (data) => {
      briefContext.setBrief({ id: data.id, createdAt: new Date() });
      queryClient.removeQueries({
        queryKey: generateQueryKey(RequestKey.Feeds, user, 'briefing'),
      });
    },
    onError: (
      error: ApiErrorResult<{
        code: ApiError;
        postId: string;
        createdAt: string;
      }>,
    ) => {
      const postId = error.response?.errors?.[0]?.extensions?.postId;

      if (postId) {
        const createdAt = new Date(
          error.response?.errors?.[0]?.extensions?.createdAt,
        );

        briefContext.setBrief({
          id: postId,
          createdAt:
            !createdAt || Number.isNaN(createdAt.getTime())
              ? new Date()
              : createdAt,
        });
        return;
      }

      if (error.response?.errors?.[0]?.message) {
        displayToast(error.response.errors[0].message);
      }
    },
  });

  return (
    <div
      className={classNames(
        'relative flex flex-1 flex-col gap-4 rounded-16 bg-surface-float px-6 py-4',
        'backdrop-blur-3xl',
        {
          'border border-border-subtlest-tertiary': showBorder,
        },
        className?.card,
      )}
    >
      {showCloseButton && (
        <CloseButton
          className="absolute right-2 top-2"
          size={ButtonSize.XSmall}
          onClick={handleDismiss}
        />
      )}
      <img
        src="/assets/brief-card-magic.png"
        alt=""
        className="brief-card-magic-float h-fit w-full object-contain"
      />
      <Typography
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
        center
      >
        {title}
      </Typography>
      {children}
      <Button
        style={{
          background: briefButtonBg,
        }}
        className="brief-card-cta-gradient mt-auto w-full text-black"
        tag="a"
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isGenerating}
        onClick={() => {
          generateBrief({ type: BriefingType.Daily });
        }}
      >
        Deploy the agent
      </Button>
    </div>
  );
};
