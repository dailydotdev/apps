import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import { webappUrl } from '../../../lib/constants';
import type { UserInterest } from '../../../graphql/interests';

/**
 * What the agents are doing, on one line above the field.
 *
 * The default treatment. Ten of these were drawn out in Storybook
 * (`Features/Interests/AgentRunningStates`); this is the plain one they all
 * get compared against.
 */
export const AgentRunStrip = ({
  agents,
}: {
  agents: UserInterest[];
}): ReactElement => {
  const [first] = agents;

  return (
    <FlexRow className="items-center gap-2 px-2 pt-0.5">
      <span
        aria-hidden
        className="size-1.5 shrink-0 animate-pulse rounded-6 bg-brand-default"
      />
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="min-w-0 flex-1 truncate"
      >
        {agents.length === 1
          ? `Hunting ${first.query}`
          : `${agents.length} agents hunting`}
      </Typography>
      <Link href={`${webappUrl}agent`}>
        <a className="shrink-0 text-text-tertiary typo-caption1 hover:text-text-primary">
          View
        </a>
      </Link>
    </FlexRow>
  );
};
