import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getTagPageLink } from '@dailydotdev/shared/src/lib/links';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TagSectionHeader } from './TagSectionHeader';
import styles from './tagShowcase.module.css';

interface TagConstellationProps {
  tag: string;
  relatedTags: { name?: string }[];
}

interface Node {
  name: string;
  x: number;
  y: number;
  delay: number;
}

const RADIUS_X = 38;
const RADIUS_Y = 40;

/**
 * "Explore the universe" — related tags rendered as an interactive
 * constellation orbiting the current tag, with connector lines and a gentle
 * float. A spatial, exploratory take on related-topic discovery that turns a
 * flat chip list into something a developer wants to play with.
 */
export function TagConstellation({
  tag,
  relatedTags,
}: TagConstellationProps): ReactElement | null {
  const names = relatedTags
    .map((related) => related.name)
    .filter((name): name is string => !!name)
    .slice(0, 8);

  if (names.length < 4) {
    return null;
  }

  const nodes: Node[] = names.map((name, index) => {
    const angle = (-90 + (360 / names.length) * index) * (Math.PI / 180);
    return {
      name,
      x: 50 + RADIUS_X * Math.cos(angle),
      y: 50 + RADIUS_Y * Math.sin(angle),
      delay: index * 0.45,
    };
  });

  return (
    <section className="flex scroll-mt-16 flex-col gap-3">
      <TagSectionHeader
        icon={<InfoIcon size={IconSize.Medium} secondary />}
        title={`Explore the ${tag} universe`}
        subtitle="Topics developers follow alongside this one — tap any to dive in."
      />
      <div className="relative mx-4 h-80 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float tablet:h-96">
        <svg
          aria-hidden
          className="absolute inset-0 size-full text-border-subtlest-tertiary"
          preserveAspectRatio="none"
        >
          {nodes.map((node) => (
            <line
              key={`line-${node.name}`}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          ))}
        </svg>

        <div
          className="absolute z-1"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="flex items-center rounded-12 bg-brand-default px-4 py-2 font-bold text-white shadow-2 typo-callout">
            #{tag}
          </span>
        </div>

        {nodes.map((node) => (
          <div
            key={node.name}
            className="absolute z-2"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Link href={getTagPageLink(node.name)} passHref prefetch={false}>
              <a
                className={classNames(
                  styles.float,
                  'block max-w-36 truncate rounded-10 border border-border-subtlest-tertiary bg-background-default px-3 py-1.5 text-center text-text-secondary transition-colors typo-footnote hover:border-border-subtlest-primary hover:bg-surface-float hover:text-text-primary',
                )}
                style={{ animationDelay: `${node.delay}s` }}
                title={`Explore #${node.name}`}
              >
                #{node.name}
              </a>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
