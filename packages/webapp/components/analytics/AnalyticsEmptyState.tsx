import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Button, ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, EditIcon } from '@dailydotdev/shared/src/components/icons';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';

export const AnalyticsEmptyState = (): ReactElement => {
  const { openModal } = useLazyModal();

  const handleNewPost = () => {
    openModal({
      type: LazyModal.NewPost,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <EditIcon className="size-16 text-text-disabled" />
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Title3}
          bold
          color={TypographyColor.Primary}
        >
          It&apos;s never too late to start posting
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="max-w-md"
        >
          Hardest part of being a developer? Where do we start... it&apos;s
          everything. Go on, share with us your best rant.
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Primary}
        icon={<PlusIcon />}
        onClick={handleNewPost}
      >
        New post
      </Button>
    </div>
  );
};
