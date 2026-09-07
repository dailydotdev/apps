import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostContentRaw } from '@dailydotdev/shared/src/components/post/PostContent';
import { PreferGoogleButton } from '@dailydotdev/shared/src/components/post/preferredSources';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { ReviewProviders, reviewPost } from './_providers';

type Args = { variant: 'current' | 'proposed' };

/**
 * The strip that appears once, right after the reader copies the post link —
 * a sharing intent, so the ask reads as part of the same gesture. Sits in the
 * `belowActions` slot under the engagement bar, button right-aligned so it
 * lines up under the Copy action that triggered it.
 */
const AfterCopyLinkStrip = (): React.ReactElement => (
  <div className="mt-3 flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2 mobileL:flex-row mobileL:items-center">
    <Typography
      className="min-w-0 flex-1"
      color={TypographyColor.Tertiary}
      type={TypographyType.Footnote}
    >
      Link copied. Want more like this when you search?
    </Typography>
    <PreferGoogleButton
      className="self-start mobileL:self-auto"
      label="Add as preferred source"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Float}
    />
  </div>
);

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/1. Post page: after copying the link',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'proposed'] },
  },
  parameters: { layout: 'fullscreen' },
  render: ({ variant }) => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default pt-4 text-text-primary">
        <PostContentRaw
          post={reviewPost}
          origin={Origin.ArticlePage}
          isPostPage
          position="relative"
          belowActions={
            variant === 'proposed' ? <AfterCopyLinkStrip /> : undefined
          }
        />
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };
