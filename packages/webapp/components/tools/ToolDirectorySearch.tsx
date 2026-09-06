import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { ToolCardTool } from './ToolCard';

interface ToolDirectorySearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onQueryChange: (query: string) => void;
  recommendedTools?: ToolCardTool[];
  className?: string;
}

export function ToolDirectorySearch({
  value,
  onValueChange,
  onQueryChange,
  recommendedTools = [],
  className,
}: ToolDirectorySearchProps): ReactElement {
  const [debouncedReport] = useDebounceFn((next?: string) => {
    onQueryChange((next ?? '').trim());
  }, 150);

  const handleChange = (next: string): void => {
    onValueChange(next);
    debouncedReport(next);
  };

  return (
    <div className={classNames('flex w-full flex-col gap-3', className)}>
      <SearchField
        inputId="tool-directory-search"
        placeholder="Search all tools"
        value={value}
        valueChanged={handleChange}
        aria-label="Search all tools"
        autoComplete="off"
      />
      {!value && recommendedTools.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Recommended:
          </Typography>
          {recommendedTools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`} passHref>
              <Typography
                tag={TypographyTag.Link}
                type={TypographyType.Footnote}
                color={TypographyColor.Primary}
                className="cursor-pointer no-underline hover:underline"
              >
                {tool.title}
              </Typography>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
