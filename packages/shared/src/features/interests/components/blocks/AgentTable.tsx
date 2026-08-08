import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';

export const AgentTable = ({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: ReactNode[][];
  caption?: string;
}): ReactElement => (
  <div className="w-full overflow-x-auto rounded-12 border border-border-subtlest-quaternary">
    <table className="w-full border-collapse text-left">
      {caption && (
        <caption className="border-b border-border-subtlest-quaternary bg-surface-float px-3 py-2 text-left">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {caption}
          </Typography>
        </caption>
      )}
      <thead className="bg-surface-float">
        <tr>
          {columns.map((column) => (
            <th key={column} className="px-3 py-2 align-middle">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                bold
              >
                {column}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtlest-quaternary">
        {rows.map((row) => (
          <tr key={String(row[0])}>
            {row.map((cell, index) => (
              <td
                // Cells are positional and can repeat their value across rows,
                // so the column index is the only stable key here.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="px-3 py-2 align-top text-text-primary typo-caption1"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
