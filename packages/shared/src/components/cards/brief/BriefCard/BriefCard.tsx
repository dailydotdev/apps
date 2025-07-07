import React from 'react';
import type { ReactNode } from 'react';
import { BriefCardDefault } from './BriefCardDefault';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { briefRefetchIntervalMs } from '../../../../graphql/posts';
import { BriefCardLoading } from './BriefCardLoading';
import { BriefCardReady } from './BriefCardReady';
import {
  formatDate,
  oneMinute,
  TimeFormatType,
} from '../../../../lib/dateFormat';
import usePostById from '../../../../hooks/usePostById';
import {
  BriefCardContextProvider,
  useBriefCardContext,
} from './BriefCardContext';

export type BriefCardProps = {
  className?: string;
  animationSrc?: string;
  progressPercentage?: number;
  headnote?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
};

const getLoadingStep = (createdAt: Date): number => {
  const targetTimeSeconds = 15;

  if (!createdAt) {
    return 0;
  }

  const elapsedSeconds = (Date.now() - createdAt.getTime()) / 1000;

  if (elapsedSeconds > targetTimeSeconds) {
    return 4;
  }

  return Math.abs(Math.ceil((elapsedSeconds / targetTimeSeconds) * 4));
};

const getLoadingProgress = ({
  loadingStep,
}: {
  loadingStep: number;
}): number => {
  const step = 100 / 4;

  const progress = Math.min(step * loadingStep, 100);

  if (progress < 5) {
    return 5;
  }

  return progress;
};

const loadingSteps: (Pick<BriefCardProps, 'animationSrc'> & {
  text: string;
})[] = [
  {
    animationSrc: '/robot-looking.json',
    text: `Compressing today's dev noise.`,
  },
  {
    animationSrc: '/robot-loading.json',
    text: `Reducing a 32-minute read to a 4-minute summary.`,
  },
  {
    animationSrc: '/robot-writing.json',
    text: `Cross-checking trends across 23,000 words of content.`,
  },
  {
    animationSrc: '/robot-loving.json',
    text: 'Wrapping it up.',
  },
];

export const BriefCardInternal = (
  props: Omit<BriefCardProps, 'state' | 'post'>,
) => {
  const briefCardContext = useBriefCardContext();
  let state: 'default' | 'loading' | 'ready' = 'default';

  const { post } = usePostById({
    id: briefCardContext.brief?.id,
    options: {
      refetchInterval: (query) => {
        const retries = Math.max(
          query.state.dataUpdateCount,
          query.state.fetchFailureCount,
        );

        // transactions are mostly processed withing few seconds
        // so for now we stop retrying after 1 minute
        const maxRetries = (oneMinute * 1000) / briefRefetchIntervalMs;

        if (retries > maxRetries) {
          return false;
        }

        const queryError = query.state.error;

        // in case of query error keep refetching until maxRetries is reached
        if (queryError) {
          return briefRefetchIntervalMs;
        }

        return false;
      },
    },
  });

  if (!post) {
    state = 'loading';
  }

  if (!briefCardContext.brief) {
    state = 'default';
  }

  const loadingStep = getLoadingStep(briefCardContext.brief?.createdAt);

  if (state === 'loading') {
    const activeStep = loadingSteps[loadingStep] ?? loadingSteps[0];

    return (
      <BriefCardLoading
        {...props}
        animationSrc={activeStep.animationSrc}
        progressPercentage={getLoadingProgress({ loadingStep })}
        headnote={formatDate({
          value: briefCardContext.brief.createdAt,
          type: TimeFormatType.LiveTimer,
        })}
        title="Generating Your Presidential Brief"
      >
        {[...loadingSteps]
          .slice(0, loadingStep || 1)
          .reverse()
          .map((item) => {
            return item.text;
          })}
      </BriefCardLoading>
    );
  }

  if (post) {
    state = 'ready';
  }

  if (state === 'ready') {
    return <BriefCardReady {...props} post={post} title={post.title} />;
  }

  return (
    <BriefCardDefault {...props} title="Too much dev news again?">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Let me summarize the latest for you — fast, focused, and fluff-free.
      </Typography>
    </BriefCardDefault>
  );
};

export const BriefCard = (props: Omit<BriefCardProps, 'post' | 'state'>) => {
  return (
    <BriefCardContextProvider>
      <BriefCardInternal {...props} />
    </BriefCardContextProvider>
  );
};
