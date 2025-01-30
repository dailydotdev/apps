export const labels = {
  reporting: {
    reportFeedbackText: '🚨 Thanks for reporting!',
  },
  error: {
    generic: '🚫 Something went wrong, please try again.',
    rateLimit: '⌛️ Rate limit exceeded, please try again later.',
  },
  squads: {
    forbidden: '🚫 You no longer have access to this Squad.',
    invalidInvitation:
      '🚫 The invitation is no longer valid, please check with the person who shared this invite (or the Squad admin) for further information.',
  },
  search: {
    feedbackText: 'Thanks for your feedback!',
    shortDescription:
      'Explore daily.dev Search, the AI-powered search engine for developers. Learn about its unique features, integration with the daily.dev platform, and how to get the most accurate search results. Your go-to guide for leveraging daily.dev Search in your coding journey.',
    rateLimitExceeded: 'Rate limiting exceeded. Please try again later.',
    unexpectedError: 'It worked on my machine. Can you please try again?',
    stoppedGenerating: 'Oops! We encountered an error! Can you try refreshing?',
  },
  auth: {
    error: {
      invalidEmailOrPassword: 'Invalid email or password',
      generic:
        '❌ We got some unexpected error from our side, nothing to worry about. Please try again.',
    },
  },
  referral: {
    generic: {
      inviteText: `I'm using daily.dev to stay updated on developer news. I think you will find it helpful:`,
    },
  },
  devcard: {
    generic: {
      shareText: `Check out my #DevCard by @dailydotdev! Flex yours (if it's flex worthy)`,
      emailTitle: 'Checkout my devcard from daily.dev!',
    },
  },
  feed: {
    prompt: {
      discard: {
        title: 'Discard changes',
        description: 'You have unsaved changes that will be lost',
        okButton: 'Yes, discard',
      },
      newDiscard: {
        title: 'Cancel feed creation?',
        description:
          "You've made some changes to your feed. If you cancel now, your changes will be lost and the feed will be deleted. Are you sure you want to proceed?",
        okButton: 'Yes, discard',
        cancelButton: 'Keep editing',
      },
      delete: {
        description:
          'Are you sure you want to delete your feed? This action cannot be undone.',
        okButton: 'Yes, delete feed',
      },
    },
    error: {
      feedLimit: {
        api: 'You have reached maximum number of feeds for your user',
        client: "Too many feeds, don't you think?",
      },
      feedNameInvalid: {
        api: 'Feed name should not contain special characters',
      },
    },
    settings: {
      globalPreferenceNotice: {
        clickbaitShield: 'Clickbait shield has been applied for all feeds',
        contentLanguage: 'New language preferences set for all feeds',
      },
    },
  },
  integrations: {
    prompt: {
      deleteIntegration: {
        title: 'Delete integration',
        description:
          'Are you sure you want to delete this integration? We will no longer have access to your slack workspace.',
        okButton: 'Yes, delete integration',
      },
      deleteSourceIntegration: {
        title: 'Delete source integration',
        description:
          'Are you sure you want to delete this integration? You will no longer receive updates from this source.',
        okButton: 'Yes, delete integration',
      },
    },
    success: {
      integrationSaved: 'Integration saved successfully',
    },
  },
};
