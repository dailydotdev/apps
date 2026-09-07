import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostContentRaw } from '@dailydotdev/shared/src/components/post/PostContent';
import { PreferGoogleButton } from '@dailydotdev/shared/src/components/post/preferredSources';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { ReviewProviders, reviewPost } from './_providers';

type Args = { variant: 'current' | 'proposed' };

/**
 * The button directly under the source card, through the existing rail slot
 * after the Source position. The column gap is 8px, but the recommend block
 * below carries its own 12px padding — so the slot takes a 12px top margin
 * to make the space above and below the button read the same.
 */
const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/2. Post page: top of the widget column',
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
          widgetsLeading={
            variant === 'current' ? null : (
              <div className="w-full">
                <PreferGoogleButton
                  className="w-full"
                  label="Add as preferred source"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Float}
                />
              </div>
            )
          }
        />
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };
