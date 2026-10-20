export interface AuthPrompt {
  view: 'signup' | 'login';
  /** authContextLines: shown on phones, on the sign-up view only. */
  line?: string;
}

export const authLines = {
  joinSquad: 'Sign up to join this Squad.',
  follow: 'Sign up to follow and get their posts in your feed.',
  mainButton: 'Sign up to get a feed built for you.',
};
