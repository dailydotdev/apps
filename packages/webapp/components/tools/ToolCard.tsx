import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { ToolIcon } from './ToolIcon';

export interface ToolCardTool {
  id: string;
  title: string;
  slug: string;
  faviconUrl: string | null;
  stackCount: number;
}

interface ToolCardProps {
  tool: ToolCardTool;
  onClick?: () => void;
}

export const ToolCard = ({ tool, onClick }: ToolCardProps): ReactElement => (
  <Link href={`/tools/${tool.slug}`} passHref>
    <a
      href={`/tools/${tool.slug}`}
      className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 hover:border-border-subtlest-secondary"
      onClick={onClick}
    >
      <ToolIcon
        title={tool.title}
        faviconUrl={tool.faviconUrl}
        className="size-10 flex-none rounded-12 object-contain"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {tool.title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {largeNumberFormat(tool.stackCount) ?? tool.stackCount} in stacks
        </Typography>
      </span>
    </a>
  </Link>
);
