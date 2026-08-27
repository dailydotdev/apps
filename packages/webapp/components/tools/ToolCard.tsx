import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { ToolLogo } from '@dailydotdev/shared/src/components/tools/ToolLogo';

export interface ToolCardTool {
  id: string;
  title: string;
  slug: string;
  faviconUrl: string | null;
  url?: string | null;
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
      <ToolLogo
        title={tool.title}
        faviconUrl={tool.faviconUrl}
        url={tool.url}
        className="size-12 rounded-14 bg-background-default p-1.5"
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
