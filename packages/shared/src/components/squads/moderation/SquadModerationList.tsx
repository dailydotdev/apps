import React, { ReactElement } from 'react';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { VIcon } from '../../icons';
import { useSquadPostModeration } from '../../../hooks/squads/useSquadPostModeration';
import { IconSize } from '../../Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useSquadPendingPosts } from '../../../hooks/squads/useSquadPendingPosts';
import { SquadModerationItem } from './SquadModerationItem';

export function SquadModerationList(): ReactElement {
  const { onApprove, onReject, isLoading } = useSquadPostModeration();
  const { data, isFetched } = useSquadPendingPosts();

  if (!data?.length) {
    if (!isFetched) {
      return (
        <div className="flex flex-col gap-4 p-6">
          <span className="typo-title3">Loading...</span>
        </div>
      );
    }

    return (
      <div className="flex w-full flex-col items-center gap-4 p-6 py-10">
        <VIcon
          secondary
          size={IconSize.XXXLarge}
          className={TypographyColor.Disabled}
        />
        <Typography type={TypographyType.Title2} bold>
          All done!
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          All caught up! There are no posts waiting for your review right now.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {data?.length > 1 && (
        <span className="flex w-full flex-row justify-end border-b border-border-subtlest-tertiary px-4 py-3">
          <Button
            icon={<VIcon secondary />}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() => onApprove(data.map((request) => request.post.id))}
          >
            Approve all {data.length} posts
          </Button>
        </span>
      )}
      {data?.map((request) => (
        <SquadModerationItem
          key={request.post.id}
          data={request}
          isLoading={isLoading}
          onReject={onReject}
          onApprove={(id) => onApprove([id])}
        />
      ))}
    </div>
  );
}
