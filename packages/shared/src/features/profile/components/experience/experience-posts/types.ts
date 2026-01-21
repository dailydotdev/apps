/**
 * Types for experience-linked posts/content
 * These represent content that users can attach to their work experiences
 */

export enum ExperiencePostType {
  Milestone = 'milestone',
  Publication = 'publication',
  Project = 'project',
  Media = 'media',
  Achievement = 'achievement',
  OpenSource = 'opensource',
}

export interface ExperiencePostBase {
  id: string;
  type: ExperiencePostType;
  title: string;
  description?: string;
  date: string;
  url?: string;
  image?: string;
}

export interface MilestonePost extends ExperiencePostBase {
  type: ExperiencePostType.Milestone;
  milestone: string; // e.g., "Promoted to Senior", "1 Year Anniversary"
}

export interface PublicationPost extends ExperiencePostBase {
  type: ExperiencePostType.Publication;
  publisher?: string; // e.g., "Medium", "Dev.to", "Company Blog"
  readTime?: number; // in minutes
}

export interface ProjectPost extends ExperiencePostBase {
  type: ExperiencePostType.Project;
  technologies?: string[];
  status?: 'completed' | 'in-progress' | 'launched';
}

export interface MediaPost extends ExperiencePostBase {
  type: ExperiencePostType.Media;
  mediaType: 'video' | 'podcast' | 'presentation' | 'talk';
  duration?: number; // in minutes
  venue?: string; // e.g., "React Conf 2024", "Company All-Hands"
}

export interface AchievementPost extends ExperiencePostBase {
  type: ExperiencePostType.Achievement;
  issuer?: string; // e.g., "AWS", "Google", "Company"
  credentialId?: string;
}

export interface OpenSourcePost extends ExperiencePostBase {
  type: ExperiencePostType.OpenSource;
  repository?: string;
  stars?: number;
  contributions?: number;
}

export type ExperiencePost =
  | MilestonePost
  | PublicationPost
  | ProjectPost
  | MediaPost
  | AchievementPost
  | OpenSourcePost;

// Post type metadata for display
export const POST_TYPE_META: Record<
  ExperiencePostType,
  { label: string; icon: string; color: string }
> = {
  [ExperiencePostType.Milestone]: {
    label: 'Milestone',
    icon: 'Flag',
    color: 'var(--theme-accent-onion-default)',
  },
  [ExperiencePostType.Publication]: {
    label: 'Publication',
    icon: 'Link',
    color: 'var(--theme-accent-water-default)',
  },
  [ExperiencePostType.Project]: {
    label: 'Project',
    icon: 'Terminal',
    color: 'var(--theme-accent-cabbage-default)',
  },
  [ExperiencePostType.Media]: {
    label: 'Media',
    icon: 'Play',
    color: 'var(--theme-accent-cheese-default)',
  },
  [ExperiencePostType.Achievement]: {
    label: 'Achievement',
    icon: 'Star',
    color: 'var(--theme-accent-bun-default)',
  },
  [ExperiencePostType.OpenSource]: {
    label: 'Open Source',
    icon: 'GitHub',
    color: 'var(--theme-accent-blueCheese-default)',
  },
};

// Mock data generator
export const generateMockExperiencePosts = (): ExperiencePost[] => {
  return [
    {
      id: '1',
      type: ExperiencePostType.Milestone,
      title: 'Promoted to Senior Software Engineer',
      description:
        'Recognized for technical leadership and mentoring contributions to the team.',
      date: '2024-06-15',
      milestone: 'Promotion',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/1',
    },
    {
      id: '2',
      type: ExperiencePostType.Publication,
      title: 'Building Scalable React Applications with Module Federation',
      description:
        'A deep dive into micro-frontend architecture and how we scaled our platform.',
      date: '2024-03-20',
      url: 'https://engineering.example.com/module-federation',
      publisher: 'Company Engineering Blog',
      readTime: 12,
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/2',
    },
    {
      id: '3',
      type: ExperiencePostType.Project,
      title: 'Platform Performance Optimization Initiative',
      description:
        'Led a cross-functional team to improve page load times by 40% through code splitting and caching strategies.',
      date: '2024-01-10',
      technologies: ['React', 'Webpack', 'Redis', 'CloudFront'],
      status: 'completed',
    },
    {
      id: '4',
      type: ExperiencePostType.Media,
      title: 'From Monolith to Microservices: Our Journey',
      description:
        'Conference talk about our migration strategy and lessons learned.',
      date: '2023-11-08',
      url: 'https://youtube.com/watch?v=example',
      mediaType: 'talk',
      duration: 35,
      venue: 'React Summit 2023',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/3',
    },
    {
      id: '5',
      type: ExperiencePostType.Achievement,
      title: 'AWS Solutions Architect Professional',
      description: 'Achieved professional-level AWS certification.',
      date: '2023-09-22',
      issuer: 'Amazon Web Services',
      credentialId: 'AWS-SAP-12345',
      url: 'https://aws.amazon.com/verification',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/4',
    },
    {
      id: '6',
      type: ExperiencePostType.OpenSource,
      title: 'react-virtual-scroll',
      description:
        'Created and maintain a high-performance virtualization library for React.',
      date: '2023-07-15',
      url: 'https://github.com/example/react-virtual-scroll',
      repository: 'example/react-virtual-scroll',
      stars: 1247,
      contributions: 89,
    },
  ];
};
