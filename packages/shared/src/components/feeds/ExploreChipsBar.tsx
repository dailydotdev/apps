import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { useLogContext } from '../../contexts/LogContext';
import { BriefSwitcher } from '../../features/briefingHome/BriefSwitcher';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { ExploreCategory } from './exploreCategories';
import { LogEvent } from '../../lib/log';

interface ExploreChipsBarProps {
  categories: ExploreCategory[];
  isPending?: boolean;
  className?: string;
}

const PLACEHOLDER_WIDTHS = ['w-20', 'w-16', 'w-24', 'w-20', 'w-28', 'w-16'];

const normalizePath = (p: string): string => {
  const noQuery = p.split('?')[0];
  if (!noQuery || noQuery === '/') {
    return '/';
  }
  return noQuery.replace(/\/$/, '');
};

export function ExploreChipsBar({
  categories,
  isPending,
  className,
}: ExploreChipsBarProps): ReactElement | null {
  const router = useRouter();
  const { logEvent } = useLogContext();

  const activePath = useMemo(
    () => normalizePath(router.asPath),
    [router.asPath],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = scrollRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    if (typeof active?.scrollIntoView !== 'function') {
      return;
    }
    active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activePath, categories]);

  return (
    <div className={classNames('relative', className)}>
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
      >
        <BriefSwitcher />
        {categories.map((category) => {
          const isActive = normalizePath(category.path) === activePath;
          return (
            <Link
              key={category.id}
              href={category.path}
              passHref
              scroll={false}
            >
              <Button
                tag="a"
                size={ButtonSize.Medium}
                variant={isActive ? ButtonVariant.Float : ButtonVariant.Subtle}
                pressed={isActive}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? 'true' : undefined}
                onClick={() => {
                  if (!category.tag) {
                    return;
                  }

                  logEvent({
                    event_name: LogEvent.ClickFeedTagChip,
                    target_id: category.tag,
                  });
                }}
              >
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  bold
                  color={
                    isActive
                      ? TypographyColor.Primary
                      : TypographyColor.Secondary
                  }
                >
                  {category.label}
                </Typography>
              </Button>
            </Link>
          );
        })}
        {isPending &&
          categories.length === 0 &&
          PLACEHOLDER_WIDTHS.map((width, index) => (
            <ElementPlaceholder
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              aria-hidden
              className={classNames('h-10 shrink-0 rounded-12', width)}
            />
          ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
      />
    </div>
  );
}
