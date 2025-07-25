import React from 'react';
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
  briefCardBg,
  briefCardBorder,
} from '../../../../styles/custom';
import type { BriefCardProps } from './BriefCard';
import { BriefGradientIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import type { ApiError, ApiErrorResult } from '../../../../graphql/common';
import { gqlClient } from '../../../../graphql/common';
import type { Post } from '../../../../graphql/posts';
import { BriefingType, GENERATE_BRIEFING } from '../../../../graphql/posts';
import { useBriefCardContext } from './BriefCardContext';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useToastNotification } from '../../../../hooks';

export type BriefCardDefaultProps = BriefCardProps;

const rootStyle = {
  border: briefCardBorder,
  background: briefCardBg,
};

export const BriefCardDefault = ({
  className,
  title,
  children,
}: BriefCardDefaultProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const briefCardContext = useBriefCardContext();
  const { user } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const result = await gqlClient.request<{
        generateBriefing: Pick<Post, 'id'>;
      }>(GENERATE_BRIEFING, {
        type: BriefingType.Daily,
      });

      return result.generateBriefing;
    },
    onSuccess: (data) => {
      briefCardContext.setBrief({ id: data.id, createdAt: new Date() });

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

        briefCardContext.setBrief({
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
      style={rootStyle}
      className={classNames(
        'flex flex-1 flex-col gap-4 rounded-16 px-6 py-4',
        'backdrop-blur-3xl',
        className?.card,
      )}
    >
      <BriefGradientIcon secondary size={IconSize.Size48} />
      <Typography
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      {children}
      <Button
        style={{
          background: briefButtonBg,
        }}
        className="mt-auto w-full text-black"
        tag="a"
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isPending}
        onClick={() => {
          mutate();
        }}
      >
        Deploy the agent
      </Button>
    </div>
  );
};
