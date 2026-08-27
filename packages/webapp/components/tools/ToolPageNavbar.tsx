import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { pageHeaderClassName } from '@dailydotdev/shared/src/components/layout/PageHeader';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

interface NavbarTool {
  title: string;
  slug: string;
}

interface ToolPageNavbarProps {
  activeTool?: NavbarTool;
  relatedTools?: NavbarTool[];
  className?: string;
}

const toolsUrl = `${webappUrl}tools`;
// Keep the strip short — a handful of relevant tabs, not a long scroller.
const MAX_TOOLS = 5;

// Tabbed strip above the tools pages, built with the same page-header navbar as
// the tags and Squad directories. A leading tab returns to the directory, then
// the tool being viewed (active) followed by tools related to it.
export function ToolPageNavbar({
  activeTool,
  relatedTools = [],
  className,
}: ToolPageNavbarProps): ReactElement {
  const tools = useMemo(() => {
    const related = relatedTools.filter(
      (tool) => tool.slug && tool.slug !== activeTool?.slug,
    );
    const ordered = activeTool ? [activeTool, ...related] : related;
    return ordered.slice(0, MAX_TOOLS);
  }, [activeTool, relatedTools]);

  return (
    <header
      className={classNames(
        pageHeaderClassName,
        'gap-4 !px-4 !py-0 tablet:!px-6',
        className,
      )}
    >
      <SquadDirectoryNavbar
        aria-label="Tools navigation"
        className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
      >
        <SquadDirectoryNavbarItem
          buttonSize={ButtonSize.Small}
          isActive={!activeTool}
          label="All tools"
          path={toolsUrl}
          ariaLabel="All tools"
        />
        {tools.map((tool) => (
          <SquadDirectoryNavbarItem
            key={tool.slug}
            buttonSize={ButtonSize.Small}
            isActive={tool.slug === activeTool?.slug}
            label={tool.title}
            path={`${toolsUrl}/${tool.slug}`}
            ariaLabel={tool.title}
          />
        ))}
      </SquadDirectoryNavbar>
    </header>
  );
}
