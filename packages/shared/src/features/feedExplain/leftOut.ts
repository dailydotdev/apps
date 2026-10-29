// Why daily-feed left a post out, in the reader's words. A step of the
// shared filter is named after the filter function that dropped the post.
const reasonCopy: Record<string, string> = {
  hidden: 'You hid it',
  blocked_tag: 'A topic you blocked',
  blocked_source: 'A source you blocked',
  blocked_authors: 'An author you blocked',
  blocked_cc: 'A kind of post you turned off',
  allowed_cc: 'A kind of post you turned off',
  post_type: 'A kind of post you turned off',
  language: 'Not in your languages',
  follow: 'Not one of your topics or follows',
  no_interest_or_follow: 'Not one of your topics or follows',
  older_than_max_age: 'Older than your oldest post setting',
  shown_too_often_without_action: 'You scrolled past it too often',
  impression_cap: 'You scrolled past it too often',
  side_topics_off: 'Only a side topic of yours, and side topics are off',
  side_topic_on_an_unproven_post:
    "Only a side topic of yours, on a post readers haven't picked up yet",
  audience_dislikes_it: "Readers didn't take to it",
  engaged: 'You already read it',
  served_daily: 'Already in your feed today',
  unusable_title: "Its title can't be shown",
};

export const describeLeftOutReason = (reason: string): string => {
  const copy = reasonCopy[reason];
  if (copy) {
    return copy;
  }
  const words = reason.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};
