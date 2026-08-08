import type { ReactElement } from 'react';
import React from 'react';
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
import Link from '../../../components/utilities/Link';
import type { AgentFeedItem } from '../hooks/useAgentFeed';
import { useAgent } from '../AgentContext';

export const AgentDebugPanel = ({
  items,
  onDelete,
  isDeleting,
}: {
  items: AgentFeedItem[];
  onDelete: () => void;
  isDeleting: boolean;
}): ReactElement => {
  const { interest, isDemo } = useAgent();

  return (
    <FlexCol className="gap-4 py-2">
      <FlexRow className="items-center gap-2">
        <Typography type={TypographyType.Body} bold className="mr-auto">
          Raw state
        </Typography>
        {isDemo && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Showing demo content
          </Typography>
        )}
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          loading={isDeleting}
          onClick={onDelete}
        >
          Delete interest
        </Button>
      </FlexRow>
      <pre className="overflow-x-auto rounded-12 bg-surface-float p-3 text-text-tertiary typo-caption1">
        {JSON.stringify(interest, null, 2)}
      </pre>
      <Typography type={TypographyType.Body} bold>
        {`Findings (${items.length})`}
      </Typography>
      <FlexCol className="gap-2">
        {items.map((item) => (
          <FlexCol
            key={item.id}
            className="gap-1 rounded-12 border border-border-subtlest-tertiary p-3"
          >
            <Link href={item.post.commentsPermalink ?? item.post.permalink}>
              <a className="typo-callout">{item.post.title}</a>
            </Link>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {`score ${item.score.toFixed(2)} · ${item.rationale}`}
            </Typography>
          </FlexCol>
        ))}
      </FlexCol>
    </FlexCol>
  );
};
