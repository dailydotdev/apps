export const stripTcoLinks = (text: string): string =>
  text.replace(/https?:\/\/t\.co\/\S+/g, '').trim();

export const formatTimeAgo = (createdAt: string): string => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};
