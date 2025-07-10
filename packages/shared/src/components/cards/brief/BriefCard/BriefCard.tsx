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

const loadingSteps: (Pick<BriefCardProps, 'animationSrc'> & {
  text: string;
})[] = [
  {
    animationSrc: '/robot-looking.json',
    text: `Reading everything from last week`,
  },
  {
    animationSrc: '/robot-loading.json',
    text: `Sorting facts from loud opinions`,
  },
  {
    animationSrc: '/robot-writing.json',
    text: `Figuring out what you'd care about`,
  },
  {
    animationSrc: '/robot-loving.json',
    text: "Checking if it's actually true",
  },
  {
    animationSrc: '/robot-loving.json',
    text: 'Reviewing your brief. Hang tight',
  },
];

const getLoadingStep = (createdAt: Date): number => {
  const targetTimeSeconds = 15;

  if (!createdAt) {
    return 0;
  }

  const elapsedSeconds = (Date.now() - createdAt.getTime()) / 1000;

  if (elapsedSeconds > targetTimeSeconds) {
    return loadingSteps.length;
  }

  return Math.abs(
    Math.ceil((elapsedSeconds / targetTimeSeconds) * loadingSteps.length),
  );
};

const getLoadingProgress = ({
  loadingStep,
}: {
  loadingStep: number;
}): number => {
  const step = 100 / loadingSteps.length;

  const progress = Math.min(step * loadingStep, 100);

  if (progress < 5) {
    return 5;
  }

  return progress;
};

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
        title="The agent asked to quit. We said no. Tough life."
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
    return <BriefCardReady {...props} post={post} title="Brief is ready!" />;
  }

  return (
    <BriefCardDefault
      {...props}
      title="We made an AI suffer so you don't have to"
    >
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        We sent an AI agent to read the entire internet. Every release, every
        hot take, and every unreadable blog post from the past week. It&apos;s
        now standing by to build a presidential brief just for you. It barely
        survived. You (hopefully) will.
      </Typography>
    </BriefCardDefault>
  );
};

export const BriefCard = (props: Omit<BriefCardProps, 'post' | 'state'>) => {
  return (
    <BriefCardContextProvider>
      <div className="flex flex-1 p-2 laptop:p-0">
        <BriefCardInternal {...props} />
      </div>
    </BriefCardContextProvider>
  );
};
