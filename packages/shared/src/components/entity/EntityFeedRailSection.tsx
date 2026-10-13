import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import HorizontalFeed from '../feeds/HorizontalFeed';
import type { HorizontalFeedProps } from '../feeds/HorizontalFeed';
import { EntitySectionHeading } from './EntitySectionHeading';
import { EntityRailWithFade } from './EntityRailWithFade';

interface EntityFeedRailSectionProps<T>
  extends Omit<HorizontalFeedProps<T>, 'emptyScreen' | 'title'> {
  heading: ReactNode;
  icon?: ReactNode;
  sectionClassName?: string;
}

const EmptyFeedSignal = ({
  onChange,
}: {
  onChange: (isEmpty: boolean) => void;
}): null => {
  useEffect(() => {
    onChange(true);
    return () => onChange(false);
  }, [onChange]);

  return null;
};

/**
 * A titled horizontal post rail for entity pages (source, tag). The whole
 * section, heading included, is hidden once the feed resolves with no posts,
 * so we never render a lonely "Most upvoted posts from X" title.
 * The feed itself stays mounted so it can recover if new data arrives.
 */
export function EntityFeedRailSection<T>({
  heading,
  icon,
  sectionClassName,
  ...feedProps
}: EntityFeedRailSectionProps<T>): ReactElement {
  const [isEmpty, setIsEmpty] = useState(false);

  return (
    <div
      className={classNames(sectionClassName, isEmpty && 'hidden')}
      aria-hidden={isEmpty || undefined}
    >
      <EntitySectionHeading icon={icon}>{heading}</EntitySectionHeading>
      <EntityRailWithFade>
        <HorizontalFeed
          {...feedProps}
          emptyScreen={<EmptyFeedSignal onChange={setIsEmpty} />}
        />
      </EntityRailWithFade>
    </div>
  );
}
