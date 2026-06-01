import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { SourceIcon, UserIcon } from '../icons';
import { IconSize } from '../Icon';
import Link from '../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export interface TagAuthorityEntity {
  id?: string;
  image: string;
  imageAlt: string;
  name: string;
  permalink: string;
  label: string;
}

interface EntityRailProps {
  id: string;
  title: string;
  description: string;
  items?: TagAuthorityEntity[];
  isLoading: boolean;
  type: 'sources' | 'contributors';
}

const EntityRail = ({
  id,
  title,
  description,
  items,
  isLoading,
  type,
}: EntityRailProps): ReactElement | null => {
  if (isLoading && (!items || items.length === 0)) {
    return (
      <section id={id} className="flex flex-col gap-3">
        <ElementPlaceholder className="h-6 w-48 rounded-10" />
        <div className="grid grid-cols-1 gap-3 mobileL:grid-cols-2 laptop:grid-cols-3">
          <ElementPlaceholder className="h-20 rounded-16" />
          <ElementPlaceholder className="h-20 rounded-16" />
          <ElementPlaceholder className="h-20 rounded-16" />
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  const Icon = type === 'sources' ? SourceIcon : UserIcon;

  return (
    <section id={id} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-10 bg-surface-float text-accent-cabbage-default">
          <Icon size={IconSize.Small} />
        </span>
        <div className="min-w-0">
          <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        </div>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto laptop:grid laptop:grid-cols-3 laptop:overflow-visible">
        {items.map((item) => (
          <Link
            href={item.permalink}
            passHref
            key={item.id || item.permalink}
            prefetch={false}
          >
            <a className="group flex min-w-56 items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover">
              <img
                src={item.image}
                alt={item.imageAlt}
                className="size-12 shrink-0 rounded-full border border-border-subtlest-tertiary object-cover"
              />
              <div className="min-w-0">
                <Typography
                  type={TypographyType.Footnote}
                  bold
                  className="truncate"
                >
                  {item.name}
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  {item.label}
                </Typography>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
};

interface TagPeopleSourcesProps {
  tag: string;
  sources?: TagAuthorityEntity[];
  contributors?: TagAuthorityEntity[];
  isSourcesLoading: boolean;
  isContributorsLoading: boolean;
  className?: string;
}

export const TagPeopleSources = ({
  tag,
  sources,
  contributors,
  isSourcesLoading,
  isContributorsLoading,
  className,
}: TagPeopleSourcesProps): ReactElement | null => {
  const hasSources = !!sources?.length || isSourcesLoading;
  const hasContributors = !!contributors?.length || isContributorsLoading;

  if (!hasSources && !hasContributors) {
    return null;
  }

  return (
    <section
      id="people-sources"
      className={classNames(
        'flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-5 laptop:p-6',
        className,
      )}
    >
      <div>
        <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
          People &amp; sources shaping #{tag}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          The developers and publications most consistently behind this topic.
        </Typography>
      </div>
      <EntityRail
        id="contributors"
        title="Top contributors"
        description="Developers consistently posting and discussing this topic."
        items={contributors}
        isLoading={isContributorsLoading}
        type="contributors"
      />
      <EntityRail
        id="sources"
        title="Top sources covering it"
        description="Publications and communities with repeated coverage."
        items={sources}
        isLoading={isSourcesLoading}
        type="sources"
      />
    </section>
  );
};
