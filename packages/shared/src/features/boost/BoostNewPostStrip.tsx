import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../../components/Icon';
import { ClearIcon, TrendingIcon } from '../../components/icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { boostNewPostBanner } from '../../lib/image';
import {
  DEFAULT_CORES_PER_DAY,
  DEFAULT_DURATION_DAYS,
} from '../../graphql/post/boost';
import { usePostBoostEstimation } from '../../hooks/post/usePostBoostEstimation';
import type { Post } from '../../graphql/posts';
import { largeNumberFormat } from '../../lib';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { Loader } from '../../components/Loader';

interface BoostNewPostStripProps {
  post: Post;
  className?: string;
}

export function BoostNewPostStrip({
  post,
  className,
}: BoostNewPostStripProps): ReactElement {
  const { isLoading, estimatedReach } = usePostBoostEstimation({
    post,
    query: {
      budget: DEFAULT_CORES_PER_DAY,
      duration: DEFAULT_DURATION_DAYS,
    },
  });

  const Container = ({ children }: PropsWithChildren) => (
    <div
      className={classNames(
        'relative mt-4 flex h-10 w-full flex-row items-center justify-end gap-1 overflow-hidden rounded-8 border border-accent-blueCheese-default bg-cover p-2',
        className,
      )}
      style={{ backgroundImage: `url('${boostNewPostBanner}')` }}
    >
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <Container>
        <Loader className="mr-2" />
      </Container>
    );
  }

  const { min, max } = estimatedReach;
  const median = (min + max) / 2;

  return (
    <Container>
      <TrendingIcon size={IconSize.Medium} />
      <Typography tag={TypographyTag.Span} type={TypographyType.Callout}>
        <span>Boost to reach</span>
        <strong className="mx-1">
          {median === 0 ? '100k' : largeNumberFormat(median)} more users
        </strong>
        <span>now!</span>
      </Typography>
      <Button
        className="ml-1"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<ClearIcon secondary />}
      />
    </Container>
  );
}
