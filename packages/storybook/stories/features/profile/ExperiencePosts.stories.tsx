import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  ExperiencePostsSection,
  ExperiencePostItem,
  ExperienceTimeline,
  generateMockExperiencePosts,
  ExperiencePostType,
} from '@dailydotdev/shared/src/features/profile/components/experience/experience-posts';
import type { ExperiencePost } from '@dailydotdev/shared/src/features/profile/components/experience/experience-posts';

const meta: Meta = {
  title: 'Features/Profile/ExperiencePosts',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const mockPosts = generateMockExperiencePosts();

/**
 * Full experience posts section with all post types.
 * Features filter tabs for different categories.
 */
export const AllPosts: StoryObj = {
  render: () => <ExperiencePostsSection posts={mockPosts} initiallyOpen />,
};

/**
 * Collapsed state showing preview counts.
 */
export const Collapsed: StoryObj = {
  render: () => (
    <ExperiencePostsSection posts={mockPosts} initiallyOpen={false} />
  ),
};

/**
 * Single milestone post item.
 */
export const MilestonePost: StoryObj = {
  render: () => {
    const post = mockPosts.find(
      (p) => p.type === ExperiencePostType.Milestone,
    ) as ExperiencePost;
    return (
      <div className="rounded-12 border border-border-subtlest-tertiary">
        <ExperiencePostItem post={post} />
      </div>
    );
  },
};

/**
 * Single publication post item.
 */
export const PublicationPost: StoryObj = {
  render: () => {
    const post = mockPosts.find(
      (p) => p.type === ExperiencePostType.Publication,
    ) as ExperiencePost;
    return (
      <div className="rounded-12 border border-border-subtlest-tertiary">
        <ExperiencePostItem post={post} />
      </div>
    );
  },
};

/**
 * Single project post item with technologies.
 */
export const ProjectPost: StoryObj = {
  render: () => {
    const post = mockPosts.find(
      (p) => p.type === ExperiencePostType.Project,
    ) as ExperiencePost;
    return (
      <div className="rounded-12 border border-border-subtlest-tertiary">
        <ExperiencePostItem post={post} />
      </div>
    );
  },
};

/**
 * Single media post item (talk/video).
 */
export const MediaPost: StoryObj = {
  render: () => {
    const post = mockPosts.find(
      (p) => p.type === ExperiencePostType.Media,
    ) as ExperiencePost;
    return (
      <div className="rounded-12 border border-border-subtlest-tertiary">
        <ExperiencePostItem post={post} />
      </div>
    );
  },
};

/**
 * Single achievement post item (certification).
 */
export const AchievementPost: StoryObj = {
  render: () => {
    const post = mockPosts.find(
      (p) => p.type === ExperiencePostType.Achievement,
    ) as ExperiencePost;
    return (
      <div className="rounded-12 border border-border-subtlest-tertiary">
        <ExperiencePostItem post={post} />
      </div>
    );
  },
};

/**
 * Single open source post item with stars.
 */
export const OpenSourcePost: StoryObj = {
  render: () => {
    const post = mockPosts.find(
      (p) => p.type === ExperiencePostType.OpenSource,
    ) as ExperiencePost;
    return (
      <div className="rounded-12 border border-border-subtlest-tertiary">
        <ExperiencePostItem post={post} />
      </div>
    );
  },
};

/**
 * Section with only a few posts (no "show more").
 */
export const FewPosts: StoryObj = {
  render: () => (
    <ExperiencePostsSection posts={mockPosts.slice(0, 2)} initiallyOpen />
  ),
};

/**
 * Section with single post type (no filter tabs).
 */
export const SingleType: StoryObj = {
  render: () => {
    const milestonesOnly = mockPosts.filter(
      (p) => p.type === ExperiencePostType.Milestone,
    );
    return <ExperiencePostsSection posts={milestonesOnly} initiallyOpen />;
  },
};

// ============================================
// TIMELINE VIEW (New funky design!)
// ============================================

/**
 * Timeline view - The new funky design with vertical timeline,
 * colored nodes, connecting lines, and hover effects.
 */
export const Timeline: StoryObj = {
  render: () => <ExperienceTimeline posts={mockPosts} initiallyOpen />,
};

/**
 * Timeline collapsed state - Shows mini colored dots preview.
 */
export const TimelineCollapsed: StoryObj = {
  render: () => <ExperienceTimeline posts={mockPosts} initiallyOpen={false} />,
};

/**
 * Timeline with fewer posts - No "show more" button needed.
 */
export const TimelineFewPosts: StoryObj = {
  render: () => (
    <ExperienceTimeline posts={mockPosts.slice(0, 3)} initiallyOpen />
  ),
};
