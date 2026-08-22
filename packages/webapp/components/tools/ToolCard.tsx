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
      className="flex items-center gap-4 rounded-16 bg-surface-float p-4 transition-colors hover:bg-surface-hover"
      onClick={onClick}
    >
      <ToolIcon
        title={tool.title}
        faviconUrl={tool.faviconUrl}
        className="size-12 flex-none rounded-14 bg-background-default object-contain p-1.5"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Body} bold truncate>
          {tool.title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {largeNumberFormat(tool.stackCount) ?? tool.stackCount} in stacks
        </Typography>
      </span>
    </a>
  </Link>
);
