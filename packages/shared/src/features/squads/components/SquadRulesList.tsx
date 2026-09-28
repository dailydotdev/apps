import type { ReactElement } from 'react';
import React from 'react';
import type { SquadRule } from '../../../graphql/sources';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

interface SquadRulesListProps {
  rules: SquadRule[];
}

export const SquadRulesList = ({
  rules,
}: SquadRulesListProps): ReactElement => (
  <ol className="flex flex-col gap-5 px-4 py-6 tablet:px-6">
    {rules.map(({ title, description }, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={index} className="flex gap-4">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Quaternary}
          bold
          className="w-5 shrink-0 tabular-nums"
        >
          {index + 1}
        </Typography>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
          {!!description && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {description}
            </Typography>
          )}
        </div>
      </li>
    ))}
  </ol>
);
