import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { RefreshIcon } from '../../../components/icons';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { InterestPost } from '../../../graphql/interests';
import type { AgentFeedItem } from '../hooks/useAgentFeed';
import { AgentFindingCard } from './AgentFindingCard';
import { AgentHeroCard } from './AgentHeroCard';
import { useAgent } from '../AgentContext';

export const AgentFeedSection = ({
  items,
  isPending,
  isFetching,
  onRefresh,
  heroPost,
}: {
  items: AgentFeedItem[];
  isPending: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  heroPost?: InterestPost;
}): ReactElement => {
  const { displayToast } = useToastNotification();
  const { interest } = useAgent();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const onDismiss = useCallback(
    (id: string) => {
      setDismissed((current) => [...current, id]);
      displayToast('Removed — the agent will avoid similar posts', {
        action: {
          copy: 'Undo',
          onClick: () =>
            setDismissed((current) => current.filter((item) => item !== id)),
        },
      });
    },
    [displayToast],
  );

  if (isPending) {
    return (
      <Typography color={TypographyColor.Tertiary} className="px-4 py-6">
        Loading what the agent found…
      </Typography>
    );
  }

  if (!items.length) {
    return (
      <FlexCol className="items-start gap-3 px-4 py-6">
        <Typography type={TypographyType.Title3} bold>
          Nothing here yet
        </Typography>
        <Typography color={TypographyColor.Tertiary}>
          The agent is still hunting. Use the toolbar below to nudge it.
        </Typography>
      </FlexCol>
    );
  }

  const visible = items.filter(({ id }) => !dismissed.includes(id));

  return (
    <FlexCol className="gap-4">
      <FlexRow className="items-center justify-between">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Sorted by how well it matches your interest
        </Typography>
        <Button
          icon={<RefreshIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          loading={isFetching}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </FlexRow>
      <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptopL:grid-cols-3">
        {heroPost && (
          <AgentHeroCard
            post={heroPost}
            query={interest?.query ?? 'your interest'}
          />
        )}
        {visible.map((item) => (
          <AgentFindingCard key={item.id} item={item} onDismiss={onDismiss} />
        ))}
      </div>
      {!visible.length && (
        <Typography color={TypographyColor.Tertiary} className="py-6">
          You dismissed everything the agent found. It will hunt again on the
          next run.
        </Typography>
      )}
    </FlexCol>
  );
};
