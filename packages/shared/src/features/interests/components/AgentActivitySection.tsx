import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  AiIcon,
  BellIcon,
  FeatherIcon,
  MagicIcon,
  RefreshIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import type { AgentActivityItem, AgentActivityKind } from '../AgentContext';
import { useAgent } from '../AgentContext';
import { mockActivity } from '../mock';
import { activityAttachment } from '../attachments';
import { AgentAddToChatButton } from './AgentAddToChatButton';

const kindIcon: Record<AgentActivityKind, ReactElement> = {
  run: <RefreshIcon size={IconSize.XSmall} />,
  command: <AiIcon size={IconSize.XSmall} />,
  finding: <MagicIcon size={IconSize.XSmall} />,
  post: <FeatherIcon size={IconSize.XSmall} />,
  notification: <BellIcon size={IconSize.XSmall} />,
};

// Named group, or the section around it would reveal every row's button at
// once the moment the pointer entered any of them.
const ActivityRow = ({ item }: { item: AgentActivityItem }): ReactElement => (
  <FlexRow className="group/item items-start gap-3">
    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
      {kindIcon[item.kind]}
    </span>
    <FlexCol className="min-w-0 flex-1 gap-0.5">
      <Typography type={TypographyType.Callout}>{item.text}</Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        <DateFormat date={item.at} type={TimeFormatType.Post} />
      </Typography>
    </FlexCol>
    {/* On the entry rather than on the panel header: what you want to talk
        about is one run, not whatever tab happens to be open. */}
    <AgentAddToChatButton
      attachment={activityAttachment(item)}
      reveal
      className="shrink-0"
    />
  </FlexRow>
);

export const AgentActivitySection = (): ReactElement => {
  const { activity } = useAgent();
  const items = [...activity, ...mockActivity];

  return (
    <FlexCol className="gap-4 py-2">
      {items.map((item) => (
        <ActivityRow key={item.id} item={item} />
      ))}
    </FlexCol>
  );
};
