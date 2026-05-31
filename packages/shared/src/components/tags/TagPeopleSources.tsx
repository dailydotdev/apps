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
        <ElementPlaceholder className="h-7 w-48 rounded-10" />
        <div className="grid grid-cols-1 gap-3 mobileL:grid-cols-2">
          <ElementPlaceholder className="h-24 rounded-16" />
          <ElementPlaceholder className="h-24 rounded-16" />
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
      <div className="flex flex-col gap-1">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          bold
          className="flex items-center gap-2"
        >
          <Icon size={IconSize.Small} className="text-accent-cabbage-default" />
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto laptop:grid laptop:grid-cols-3 laptop:overflow-visible">
        {items.map((item) => (
          <Link
            href={item.permalink}
            passHref
            key={item.id || item.permalink}
            prefetch={false}
          >
            <a className="group relative flex min-w-56 overflow-hidden rounded-18 border border-border-subtlest-tertiary bg-surface-float p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:bg-surface-hover hover:shadow-2">
              <div className="from-accent-cabbage-default/0 to-accent-onion-default/0 group-hover:opacity-5 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200" />
              <div className="relative flex min-w-0 items-center gap-3">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="size-14 shrink-0 rounded-full border border-border-subtlest-tertiary object-cover"
                />
                <div className="min-w-0">
                  <Typography
                    type={TypographyType.Callout}
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
                    {item.label} signal
                  </Typography>
                </div>
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
        'mb-6 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2',
        className,
      )}
    >
      <div className="grid gap-3 laptop:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-5">
          <div className="bg-accent-water-default/15 pointer-events-none absolute -right-14 -top-14 size-44 rounded-full blur-3xl" />
          <div className="relative">
            <span className="w-fit rounded-full bg-accent-water-subtlest px-3 py-1 font-bold text-accent-water-default typo-caption1">
              Trust graph
            </span>
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
              className="mt-4"
            >
              Who shapes #{tag}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="mt-3"
            >
              Directories work when they tell you who to trust. This hub exposes
              the developers and sources repeatedly connected to the topic.
            </Typography>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-16 bg-surface-float p-3">
                <p className="font-bold typo-title3">
                  {contributors?.length ?? 0}
                </p>
                <p className="text-text-tertiary typo-caption1">contributors</p>
              </div>
              <div className="rounded-16 bg-surface-float p-3">
                <p className="font-bold typo-title3">{sources?.length ?? 0}</p>
                <p className="text-text-tertiary typo-caption1">sources</p>
              </div>
            </div>
          </div>
        </aside>
        <div className="flex flex-col gap-6 rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-4 laptop:p-5">
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
        </div>
      </div>
    </section>
  );
};
