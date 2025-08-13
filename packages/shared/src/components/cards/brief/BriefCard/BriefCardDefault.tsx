import React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
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
import { useGenerateBrief } from '../../../../features/briefing/hooks/useGenerateBrief';
import { BriefingType } from '../../../../graphql/posts';
import { useBriefCardContext } from './BriefCardContext';
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
  const briefCardContext = useBriefCardContext();
  const { displayToast } = useToastNotification();

  const { generateBrief, isGenerating } = useGenerateBrief({
    onSuccess: async (data) => {
      briefCardContext.setBrief({ id: data.id, createdAt: new Date() });
    },
    onError: (error) => {
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
