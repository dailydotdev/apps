// Embeds a mock's bare screen, without its device stage, for pages that
// frame it themselves.
export const bareStory = (storyId: string): string =>
  `${storyId}&args=bare:!true`;
