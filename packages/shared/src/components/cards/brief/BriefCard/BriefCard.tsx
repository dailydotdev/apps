import React from 'react';
import type { ReactNode } from 'react';
import { BriefCardDefault } from './BriefCardDefault';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import type { Post } from '../../../../graphql/posts';
import { BriefCardLoading } from './BriefCardLoading';
import { BriefCardReady } from './BriefCardReady';

export type BriefCardProps = {
  post?: Post;
  className?: string;
  animationSrc?: string;
  progressPercentage?: number;
  headnote?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  state?: 'default' | 'loading' | 'ready';
};

export const BriefCard = (props: Pick<BriefCardProps, 'state' | 'post'>) => {
  const { state } = props;

  if (state === 'loading') {
    return (
      <BriefCardLoading
        {...props}
        animationSrc="/robot-loading.json"
        progressPercentage={40}
        headnote="12s"
        title="Generating Your Presidential Brief"
      >
        <>Reducing a 32-minute read to a 4-minute summary.</>
        <>Cross-checking trends across 23,000 words of content.</>
        <>Compressing today&apos;s dev noise.</>
      </BriefCardLoading>
    );
  }

  if (state === 'ready') {
    return <BriefCardReady {...props} title="Presidential briefing" />;
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
