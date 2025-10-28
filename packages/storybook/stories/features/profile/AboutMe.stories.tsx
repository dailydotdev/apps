import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AboutMe } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/AboutMe';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { fn } from 'storybook/test';

const meta: Meta<typeof AboutMe> = {
  title: 'Features/Profile/AboutMe',
  component: AboutMe,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
          },
        },
      });

      const LogContext = getLogContextStatic();

      const mockUser = {
        id: '1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image:
          'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
        providers: ['google'],
      };

      return (
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider
            value={{
              user: mockUser,
              shouldShowLogin: false,
              showLogin: fn(),
              logout: fn(),
              updateUser: fn(),
              tokenRefreshed: true,
              getRedirectUri: fn(),
              loadingUser: false,
              loadedUserFromCache: true,
              refetchBoot: fn(),
              squads: [],
              isAndroidApp: false,
            }}
          >
            <LogContext.Provider
              value={{
                logEvent: fn(),
                logEventStart: fn(),
                logEventEnd: fn(),
                sendBeacon: fn(),
              }}
            >
              <div className="max-w-[800px]">
                <Story />
              </div>
            </LogContext.Provider>
          </AuthContext.Provider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof AboutMe>;

const shortContent = `
# Here to break production

Yes I do love to break production 🙈

I'm a passionate developer who enjoys learning new technologies and building great products.
`;

const longContent = `
# Here to break production

Yes I do love to break production 🙈

I'm a passionate developer who enjoys learning new technologies and building great products. I have over 10 years of experience in software development, working with various technologies and frameworks.

## My Journey

Started my journey as a junior developer and worked my way up through various roles. I've worked on:

- Large-scale web applications
- Mobile apps
- Cloud infrastructure
- DevOps and CI/CD pipelines

## Technologies I Love

I'm particularly interested in:

- React and Next.js
- TypeScript
- Node.js
- GraphQL
- PostgreSQL
- Docker and Kubernetes

![Development Setup](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop)

## What Drives Me

I believe in writing clean, maintainable code and sharing knowledge with the community. When I'm not coding, you can find me:

- Contributing to open source projects
- Writing technical blog posts
- Attending tech conferences
- Mentoring junior developers

Feel free to reach out if you want to collaborate on something exciting!
`;

export const Default: Story = {
  args: {
    user: {
      id: '1',
      username: 'testuser',
      name: 'Test User',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
      readmeHtml: shortContent,
    },
  },
};

export const LongContent: Story = {
  args: {
    user: {
      id: '1',
      username: 'testuser',
      name: 'Test User',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
      readmeHtml: longContent,
    },
  },
};

export const EmptyStateOwnProfile: Story = {
  args: {
    user: {
      id: '1',
      username: 'testuser',
      name: 'Test User',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
      readmeHtml: undefined,
    },
  },
};

export const EmptyStateOtherProfile: Story = {
  args: {
    user: {
      id: '2',
      username: 'otheruser',
      name: 'Other User',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/placeholder.jpg',
      readmeHtml: undefined,
    },
  },
};
