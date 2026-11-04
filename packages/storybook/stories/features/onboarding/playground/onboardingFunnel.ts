import type { FunnelJSON } from '@dailydotdev/shared/src/features/onboarding/types/funnel';

/**
 * The production signup onboarding funnel, verbatim from
 * `GET /boot/funnels/onboarding` (organic-v12, captured 2026-10-28). The repo
 * has no copy of it: the page fetches it at request time.
 */
export const ONBOARDING_FUNNEL = {
  id: 'organic-v12',
  version: 1,
  entry_point: 'dac2daa4-6a2f-40fe-9afb-27c40111ad95',
  parameters: {
    theme: {
      mode: 'dark',
    },
    cookieConsent: {
      show: false,
    },
  },
  chapters: [
    {
      id: 'a',
      title: 'Onboarding',
      steps: [
        {
          id: 'dac2daa4-6a2f-40fe-9afb-27c40111ad95',
          name: 'Signup',
          type: 'heroLanding',
          parameters: {
            headline: "Where developers discover what's next",
            background: 'desk',
            imageMode: 'image',
            imageMobile:
              'https://media.daily.dev/image/upload/s--r4MiKjLD--/f_auto/v1743601527/public/login%20background',
            showOrbs: true,
            oauthOrder: 'googleFirst',
            forceDarkTheme: true,
          },
          transitions: [
            {
              on: 'complete',
              destination: 'd32c098b-2cae-43c6-b82f-ac2ae47cb5ab',
            },
          ],
        },
        {
          id: 'd32c098b-2cae-43c6-b82f-ac2ae47cb5ab',
          name: 'Who are you',
          type: 'userRole',
          parameters: {
            headline: '',
            explainer: '',
            cta: '',
            roles: [],
          },
          transitions: [
            {
              on: 'complete',
              destination: 'c5f28806-d604-42bd-ad50-a3f175ab9af4',
            },
          ],
        },
        {
          id: 'c5f28806-d604-42bd-ad50-a3f175ab9af4',
          name: 'How did you hear about us',
          type: 'acquisition',
          parameters: {
            headline: '',
            explainer: '',
            cta: '',
          },
          transitions: [
            {
              on: 'complete',
              destination: 'tags',
            },
          ],
        },
        {
          id: 'tags',
          name: 'Tag Selection',
          type: 'editTags',
          parameters: {
            headline: 'Pick tags that are relevant to you',
            cta: '',
            minimumRequirement: 5,
          },
          transitions: [
            {
              on: 'complete',
              destination: 'reading_reminder',
            },
          ],
        },
      ],
    },
    {
      id: 'c',
      title: 'Promotions',
      steps: [
        {
          id: 'reading_reminder',
          name: 'Reading Reminder',
          type: 'readingReminder',
          parameters: {
            headline: '',
            cta: '',
          },
          transitions: [
            {
              on: 'complete',
              destination: 'pwa',
            },
            {
              on: 'skip',
              destination: 'next',
              placement: 'default',
            },
          ],
        },
        {
          id: 'pwa',
          name: 'Install PWA',
          type: 'installPwa',
          parameters: {
            headline: '',
            cta: '',
            explainer: '',
            poster: {
              default:
                'https://daily-now-res.cloudinary.com/image/upload/s--_kFKAft3--/f_auto/v1735045791/web_-_safari_j52hcx',
              chrome:
                'https://daily-now-res.cloudinary.com/image/upload/s--6ajr-Fje--/f_auto/v1735045791/web_-_chrome_we4vak',
            },
            src: {
              default:
                'https://daily-now-res.cloudinary.com/video/upload/s--gN1-dqeq--/v1735029367/web_-_safari_e3wes4.mp4',
              chrome:
                'https://daily-now-res.cloudinary.com/video/upload/s--RD5n9hm9--/v1735044247/web_-_chrome_xavter.mp4',
            },
          },
          transitions: [
            {
              on: 'complete',
              destination: 'extension',
            },
            {
              on: 'skip',
              destination: 'next',
              placement: 'default',
            },
          ],
        },
        {
          id: 'extension',
          name: 'Browser Extension',
          type: 'browserExtension',
          transitions: [
            {
              on: 'complete',
              destination: 'finish',
            },
            {
              on: 'skip',
              destination: 'finish',
              placement: 'default',
            },
          ],
          parameters: {
            headline: 'Transform every new tab into a learning powerhouse',
            explainer:
              'Unlock the power of every new tab with daily.dev extension.<br/>Personalized feed, developer communities, AI search and more!',
            cta: 'Get it for {browser}',
            skip: 'Dare to skip? <strong>You might miss out</strong>.',
            showReviews: false,
          },
        },
      ],
    },
  ],
} as unknown as FunnelJSON;
