import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { AiIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useAgent } from '../AgentContext';
import { AgentStatusChip } from './AgentStatusChip';

export const AgentHeaderTitle = ({
  isCondensed,
}: {
  isCondensed: boolean;
}): ReactElement => {
  const { interest } = useAgent();
  const title = interest?.query ?? 'Your agent';

  return (
    <FlexRow
      className={classNames(
        'min-w-0 flex-1 items-center gap-2 transition-all duration-200 ease-out',
        isCondensed ? 'translate-y-0 opacity-100' : 'opacity-100',
      )}
    >
      <span
        className={classNames(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-8 bg-action-bookmark-float transition-all duration-200 ease-out',
          isCondensed ? 'size-7 opacity-100' : 'size-0 opacity-0',
        )}
      >
        <AiIcon size={IconSize.XSmall} className="text-brand-default" />
      </span>
      <FlexCol
        className={classNames(
          'min-w-0 flex-1 transition-all duration-200 ease-out',
          isCondensed
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0',
        )}
      >
        <strong className="min-w-0 truncate typo-callout">{title}</strong>
      </FlexCol>
      <div
        className={classNames(
          'transition-opacity duration-200 ease-out',
          isCondensed ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <AgentStatusChip compact />
      </div>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
        className={classNames(
          'hidden shrink-0 transition-opacity duration-200 ease-out tablet:block',
          isCondensed ? 'opacity-100' : 'opacity-0',
        )}
      >
        {interest?.lastRunSummary}
      </Typography>
    </FlexRow>
  );
};
