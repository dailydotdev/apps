/**
 * What every feed action is called, what it does and how to take it back,
 * so cards, the complaint box, Feed settings and Tune all say the same thing.
 */
export enum FeedAction {
  Follow = 'follow',
  Unfollow = 'unfollow',
  ShowMore = 'show_more',
  Auto = 'auto',
  ShowLess = 'show_less',
  StopLearning = 'stop_learning',
  FewerLikeThis = 'fewer_like_this',
  HidePost = 'hide_post',
  HideCategory = 'hide_category',
  Block = 'block',
  Unblock = 'unblock',
}

export interface GlossaryEntry {
  verb: string;
  effect: string;
  undo: string;
}

export const glossary: Record<FeedAction, GlossaryEntry> = {
  [FeedAction.Follow]: {
    verb: 'Follow',
    effect: 'Adds every post on it and ranks them higher.',
    undo: 'Unfollow it in the same place.',
  },
  [FeedAction.Unfollow]: {
    verb: 'Unfollow',
    effect:
      'Its posts only show when your reading or other follows bring them.',
    undo: 'Follow it again.',
  },
  [FeedAction.ShowMore]: {
    verb: 'Show more',
    effect: 'Ranks it higher, adds nothing new.',
    undo: 'Set it back to Auto.',
  },
  [FeedAction.Auto]: {
    verb: 'Auto',
    effect: 'Your follows and reading decide how much it counts.',
    undo: 'Pick another level anytime.',
  },
  [FeedAction.ShowLess]: {
    verb: 'Show less',
    effect: 'Ranks it lower, the best posts still show.',
    undo: 'Set it back to Auto.',
  },
  [FeedAction.StopLearning]: {
    verb: 'Stop learning',
    effect: 'Reading about it stops counting; follows still work.',
    undo: 'Set it back to Auto.',
  },
  [FeedAction.FewerLikeThis]: {
    verb: 'Fewer like this',
    effect: 'Removes this post and shows less of its main topic.',
    undo: 'Undo on the card, or set the topic back to Auto.',
  },
  [FeedAction.HidePost]: {
    verb: 'Just this post',
    effect: 'Removes this post, nothing else changes.',
    undo: 'Undo on the card.',
  },
  [FeedAction.HideCategory]: {
    verb: 'Hide',
    effect: 'No posts of that kind, except from sources you follow.',
    undo: 'Turn it back on in Feed settings > Filters.',
  },
  [FeedAction.Block]: {
    verb: 'Block',
    effect: 'Never shows.',
    undo: 'Reversible in Feed settings > Filters > Blocked.',
  },
  [FeedAction.Unblock]: {
    verb: 'Unblock',
    effect: 'Its posts can show again.',
    undo: 'Block it again.',
  },
};

/** A tooltip for an action on a thing, like "Show less #ai. Ranks it lower…". */
export const describeAction = (
  action: FeedAction,
  subject?: string,
): string => {
  const { verb, effect } = glossary[action];
  return `${subject ? `${verb} ${subject}` : verb}. ${effect}`;
};
