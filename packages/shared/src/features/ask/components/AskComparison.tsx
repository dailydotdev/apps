import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { VIcon } from '../../../components/icons';

const rows = [
  {
    label: 'Source quality',
    web: 'Random web results',
    ask: 'Community-vetted articles',
  },
  {
    label: 'Ranking',
    web: 'SEO / page rank',
    ask: 'Developer upvotes',
  },
  {
    label: 'Hallucination risk',
    web: 'High, unverified sources',
    ask: 'Low, every claim linked to source',
  },
  {
    label: 'Content type',
    web: 'Anything on the internet',
    ask: 'Developer articles only',
  },
  {
    label: 'Quality signal',
    web: 'None',
    ask: 'Upvotes, comments, read time',
  },
];

export const AskComparison = (): ReactElement => {
  return (
    <FlexCol className="gap-4">
      <Typography type={TypographyType.Title3} bold center>
        WebSearch vs daily-dev-ask
      </Typography>
      <div className="overflow-hidden rounded-16 border border-border-subtlest-tertiary">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtlest-tertiary bg-surface-float">
              <th className="p-3 text-left" aria-label="Category">
                <Typography type={TypographyType.Footnote} bold>
                  &nbsp;
                </Typography>
              </th>
              <th className="p-3 text-left">
                <Typography
                  type={TypographyType.Footnote}
                  bold
                  color={TypographyColor.Tertiary}
                >
                  WebSearch
                </Typography>
              </th>
              <th className="p-3 text-left">
                <span className="flex items-center gap-1 font-bold typo-footnote">
                  <VIcon className="text-status-success" />
                  daily-dev-ask
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, web, ask }, index) => (
              <tr
                key={label}
                className={
                  index < rows.length - 1
                    ? 'border-b border-border-subtlest-tertiary'
                    : undefined
                }
              >
                <td className="p-3">
                  <Typography type={TypographyType.Footnote} bold>
                    {label}
                  </Typography>
                </td>
                <td className="p-3">
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {web}
                  </Typography>
                </td>
                <td className="p-3">
                  <Typography type={TypographyType.Footnote}>{ask}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FlexCol>
  );
};
