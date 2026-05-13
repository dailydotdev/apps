import classNames from 'classnames';
import type { AnimationEvent, ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { AlertDot, AlertColor } from '../AlertDot';
import { Button, ButtonColor } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import type { Tag } from '../../graphql/feedSettings';
import type { OnSelectTagProps } from './common';
import { subscribePersonaSelection } from '../onboarding/onboardingPopBus';

const SPARK_COUNT = 5;

export type OnboardingTagProps = {
  tag: Tag;
  onClick: (props: Pick<OnSelectTagProps, 'tag'>) => void;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isExiting?: boolean;
  onExited?: (tagName: string) => void;
};

export const TagElement = ({
  tag,
  onClick,
  isSelected = false,
  isHighlighted = false,
  isExiting = false,
  onExited,
  ...attrs
}: OnboardingTagProps): ReactElement => {
  const [popDelayMs, setPopDelayMs] = useState<number | null>(null);

  useEffect(() => {
    return subscribePersonaSelection((tagNames) => {
      const idx = tagNames.indexOf(tag.name ?? '');
      if (idx === -1) {
        return;
      }
      setPopDelayMs(Math.min(idx, 9) * 60);
    });
  }, [tag.name]);

  const isPopping = popDelayMs !== null && !isExiting;

  const sparks = useMemo(() => {
    if (!isPopping) {
      return [];
    }
    return Array.from({ length: SPARK_COUNT }, (_, i) => {
      const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.6;
      const radius = 18 + Math.random() * 12;
      return {
        fx: `${Math.cos(angle) * radius}px`,
        fy: `${Math.sin(angle) * radius}px`,
      };
    });
  }, [isPopping]);

  const className = classNames(
    { 'btn-tag': !isSelected },
    'relative',
    isExiting && 'pointer-events-none animate-tag-fade-out',
    !isExiting && isPopping && 'animate-tag-pop',
  );
  const style =
    !isExiting && isPopping ? { animationDelay: `${popDelayMs}ms` } : undefined;
  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (event.animationName === 'tag-fade-out') {
      if (tag.name) {
        onExited?.(tag.name);
      }
      return;
    }
    if (event.animationName === 'tag-pop') {
      setPopDelayMs(null);
    }
  };
  const handleClick = () => {
    if (isExiting) {
      return;
    }
    onClick({ tag });
  };
  const content = (
    <>
      {tag.name}
      {isHighlighted && (
        <AlertDot
          className="absolute right-1 top-1"
          color={AlertColor.Cabbage}
        />
      )}
      {isPopping && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2"
        >
          {sparks.map((spark, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="tag-spark animate-tag-spark"
              style={{
                ['--spark-fx' as string]: spark.fx,
                ['--spark-fy' as string]: spark.fy,
                animationDelay: `${(popDelayMs ?? 0) + i * 30}ms`,
              }}
            />
          ))}
        </span>
      )}
    </>
  );

  if (isSelected) {
    return (
      <Button
        className={className}
        style={style}
        onAnimationEnd={handleAnimationEnd}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        onClick={handleClick}
        {...attrs}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      style={style}
      onAnimationEnd={handleAnimationEnd}
      variant={ButtonVariant.Float}
      onClick={handleClick}
      {...attrs}
    >
      {content}
    </Button>
  );
};
