import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { IconSize } from '../../../components/Icon';
import type { GivebackAction, GivebackUserAction } from '../types';
import { GivebackUserActionStatus } from '../types';
import { formatDonationAmount } from '../utils';
import {
  getUserActionStatusClassName,
  getUserActionStatusLabel,
} from '../statusLabels';
import { actionPlatformVisual } from '../actionPlatform';

interface ActionCardProps {
  action: GivebackAction;
  userAction?: GivebackUserAction;
  onSubmit?: (action: GivebackAction) => void;
}

const getStatus = (userAction?: GivebackUserAction): GivebackUserActionStatus =>
  userAction?.status ?? GivebackUserActionStatus.NotStarted;

export const ActionCard = ({
  action,
  userAction,
  onSubmit,
}: ActionCardProps): ReactElement => {
  const status = getStatus(userAction);
  const isUnavailable =
    status === GivebackUserActionStatus.Expired ||
    status === GivebackUserActionStatus.Rejected;
  const canSubmit =
    !action.isLoveAction &&
    action.donationEligible &&
    [
      GivebackUserActionStatus.NotStarted,
      GivebackUserActionStatus.Started,
      GivebackUserActionStatus.NeedsMoreInfo,
    ].includes(status);
  const isInteractive = canSubmit && !!onSubmit;
  const showStatus = status !== GivebackUserActionStatus.NotStarted;
  const { Icon, name: platformName } = actionPlatformVisual[action.platform];

  const content: ReactNode = (
    <>
      <FlexRow className="items-start justify-between gap-3">
        <FlexRow className="min-w-0 items-center gap-2.5">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-14 bg-white transition-transform duration-200 group-hover:scale-105">
            <Icon secondary size={IconSize.Large} />
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="truncate uppercase tracking-wider"
          >
            {platformName}
          </Typography>
        </FlexRow>
        {action.isLoveAction ? (
          <Typography
            bold
            type={TypographyType.Caption1}
            className="shrink-0 text-accent-cabbage-default"
          >
            Just for love
          </Typography>
        ) : (
          <Typography
            bold
            type={TypographyType.Title4}
            className="shrink-0 tabular-nums text-status-success"
          >
            +{formatDonationAmount(action.donationAmount, action.currency)}
          </Typography>
        )}
      </FlexRow>

      <FlexCol className="flex-1 gap-1">
        <Typography bold tag={TypographyTag.H3} type={TypographyType.Callout}>
          {action.title}
        </Typography>
        {action.description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="line-clamp-2"
          >
            {action.description}
          </Typography>
        )}
      </FlexCol>

      <FlexRow className="items-center justify-between gap-2">
        {action.isLoveAction ? (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            We can&apos;t pay for this, but we&apos;d genuinely appreciate it.
          </Typography>
        ) : (
          showStatus && (
            <Typography
              bold
              type={TypographyType.Caption1}
              className={getUserActionStatusClassName(status)}
            >
              {getUserActionStatusLabel(status)}
            </Typography>
          )
        )}
        {isInteractive && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
            className="ml-auto inline-flex items-center gap-0.5 transition-colors group-hover:text-text-primary"
          >
            Submit proof
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              ›
            </span>
          </Typography>
        )}
      </FlexRow>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        aria-label={`Submit proof for ${action.title}`}
        onClick={() => onSubmit?.(action)}
        className="group flex h-full w-full flex-col gap-3 rounded-16 bg-surface-float p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-hover hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={classNames(
        'flex h-full w-full flex-col gap-3 rounded-16 p-4',
        action.isLoveAction ? 'bg-accent-cabbage-flat' : 'bg-surface-float',
        isUnavailable && 'opacity-70',
      )}
    >
      {content}
    </div>
  );
};
