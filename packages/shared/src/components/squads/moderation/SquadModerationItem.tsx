import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SourcePostModeration } from '../../../graphql/squads';
import {
  PostModerationReason,
  postModerationReasonLabels,
  SourcePostModerationStatus,
} from '../../../graphql/squads';
import type { Squad } from '../../../graphql/sources';
import { PostType } from '../../../types';
import { SquadModerationActions } from './SquadModerationActions';
import { AlertPointerMessage } from '../../alert/common';
import { AlertColor } from '../../AlertDot';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { Checkbox } from '../../fields/Checkbox';
import { capitalize } from '../../../lib/strings';
import { TimerIcon, WarningIcon } from '../../icons';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useSourceModerationList } from '../../../hooks/squads/useSourceModerationList';
import { SquadModerationItemContextMenu } from './SquadModerationItemContextMenu';
import { SquadModerationAuthorMenu } from './SquadModerationAuthorMenu';
import {
  SquadModerationAuthor,
  SquadModerationSignals,
} from './SquadModerationAuthor';
import { SquadModerationContent } from './SquadModerationContent';

export interface SquadModerationItemProps {
  data: SourcePostModeration;
  isModerator: boolean;
  /** Unset on the queue of every squad the viewer moderates. */
  squad?: Squad;
  isSelected?: boolean;
  /** Set when the queue can act on several posts at once. */
  onToggleSelect?: (isSelected: boolean) => void;
}

export function SquadModerationItem({
  data,
  isModerator,
  squad,
  isSelected = false,
  onToggleSelect,
}: SquadModerationItemProps): ReactElement {
  const { openModal } = useLazyModal();
  const moderation = useSourceModerationList();
  const { status, rejectionReason, moderatorMessage, createdBy } = data;
  const squadName = (squad ?? data.source)?.name;
  const isRejected = status === SourcePostModerationStatus.Rejected;
  const StatusIcon = isRejected ? WarningIcon : TimerIcon;

  const onPreview = () =>
    openModal({
      type: LazyModal.PostModeration,
      props: { data, isModerator, showSource: !squad },
    });

  return (
    <article
      className={classNames(
        'relative flex flex-col gap-3 border-b border-border-subtlest-tertiary px-4 py-4 hover:bg-surface-hover tablet:px-6',
        isSelected && 'bg-surface-float',
      )}
    >
      <button
        aria-label={`Review the post by ${createdBy?.name}`}
        className="absolute inset-0"
        onClick={onPreview}
        type="button"
      />
      <div className="flex items-center gap-1">
        {onToggleSelect && (
          <Checkbox
            name={`select-${data.id}`}
            checked={isSelected}
            onToggleCallback={onToggleSelect}
            className="-ml-1 !pr-0"
            checkmarkClassName="!mr-2"
          >
            <span className="sr-only">
              Select the post by {createdBy?.name}
            </span>
          </Checkbox>
        )}
        <SquadModerationAuthor data={data} className="flex-1" />
        <span className="relative z-1 flex shrink-0 items-center gap-2">
          {isModerator ? (
            <SquadModerationAuthorMenu
              data={data}
              onReject={moderation.onReject}
              onMute={moderation.onMute}
              onBlock={moderation.onBlock}
            />
          ) : (
            <>
              <Button
                icon={<StatusIcon aria-hidden secondary />}
                variant={ButtonVariant.Float}
                size={ButtonSize.XSmall}
                disabled
              >
                {capitalize(status)}
              </Button>
              <SquadModerationItemContextMenu
                id={data.id}
                onDelete={moderation.onDelete}
                canEdit={data.type !== PostType.Poll}
              />
            </>
          )}
        </span>
      </div>
      {isModerator && (
        <SquadModerationSignals data={data} showSource={!squad} />
      )}
      <SquadModerationContent data={data} />
      {isRejected && !isModerator && (
        <AlertPointerMessage color={AlertColor.Bun}>
          Your post in {squadName} was not approved:{' '}
          {rejectionReason
            ? postModerationReasonLabels[rejectionReason]
            : postModerationReasonLabels[PostModerationReason.Other]}
          .{moderatorMessage && ` "${moderatorMessage}"`} Please review the
          feedback and consider making changes before resubmitting.
        </AlertPointerMessage>
      )}
      {isModerator && (
        <SquadModerationActions
          className="relative z-1 tablet:justify-end"
          isLoading={moderation.isPending}
          onReject={() => moderation.onReject([data])}
          onApprove={() => moderation.onApprove([data])}
        />
      )}
    </article>
  );
}
