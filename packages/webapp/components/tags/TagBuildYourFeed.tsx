import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

interface TagBuildYourFeedProps {
  tag: string;
  relatedTags: { name?: string }[];
  /**
   * Fires with the set of selected topics. Pre-signup persistence of the
   * selection is a backend follow-up; today this hands off to the auth flow so
   * the visitor signs up with clear intent (and we can seed the feed afterwards).
   */
  onCreateFeed: (tags: string[]) => void;
}

/**
 * Anonymous-only "aha before auth" funnel. Instead of asking a cold visitor to
 * follow a single tag, we let them assemble a starter feed from the tag they
 * landed on plus related topics, then convert with a single CTA. The value
 * (a personalized feed) is felt before the signup form appears.
 */
export function TagBuildYourFeed({
  tag,
  relatedTags,
  onCreateFeed,
}: TagBuildYourFeedProps): ReactElement | null {
  const options = useMemo(() => {
    const names = [
      tag,
      ...relatedTags
        .map((related) => related.name)
        .filter((name): name is string => !!name),
    ];
    return Array.from(new Set(names));
  }, [tag, relatedTags]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set([tag]));

  if (options.length <= 1) {
    return null;
  }

  const toggle = (name: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <section className="mx-4 flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4 laptop:p-6">
      <div className="flex flex-col gap-1">
        <p className="font-bold typo-body">Build your {tag} feed</p>
        <p className="text-text-tertiary typo-footnote">
          Pick the topics you care about and get a feed tailored to you — joined
          by millions of developers.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Topics to follow">
        {options.map((name) => {
          const isSelected = selected.has(name);
          return (
            <li key={name}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(name)}
                className={classNames(
                  'flex h-8 items-center gap-1.5 rounded-10 border px-3 transition-colors typo-footnote',
                  isSelected
                    ? 'border-transparent bg-action-upvote-float text-action-upvote-default'
                    : 'border-border-subtlest-tertiary text-text-tertiary hover:bg-surface-float',
                )}
              >
                {isSelected ? (
                  <VIcon size={IconSize.Size16} aria-hidden />
                ) : (
                  <PlusIcon size={IconSize.Size16} aria-hidden />
                )}
                #{name}
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="mr-auto"
        onClick={() => onCreateFeed(Array.from(selected))}
        disabled={selected.size === 0}
      >
        Create my feed
        {selected.size > 0 ? ` · ${selected.size} topics` : ''}
      </Button>
    </section>
  );
}
