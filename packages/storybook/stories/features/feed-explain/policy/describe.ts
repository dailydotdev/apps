import type { Decision, PersonalizationState } from './rank';
import { Exclusion, FollowKind, Lane, storyNow, TopicRole } from './rank';
import { expiryKey, formatUntil } from './timed';
import { getCuration } from './curation';
import { InterestOrigin, Strength, TopicMode } from './profile';
import type { Interest } from './profile';
import { formatParam, ParamFormat } from './params';

/** What put a card on the page, for the mix bar and the reason dot. */
export enum ReasonCategory {
  Followed = 'followed',
  Learned = 'learned',
  Following = 'following',
  Popular = 'popular',
}

export const reasonCategories: Array<{
  category: ReasonCategory;
  label: string;
  dotClassName: string;
}> = [
  {
    category: ReasonCategory.Followed,
    label: 'Topics you follow',
    dotClassName: 'bg-accent-cabbage-default',
  },
  {
    category: ReasonCategory.Learned,
    label: 'Learned from reading',
    dotClassName: 'bg-accent-blueCheese-default',
  },
  {
    category: ReasonCategory.Following,
    label: 'Sources you follow',
    dotClassName: 'bg-accent-water-default',
  },
  {
    category: ReasonCategory.Popular,
    label: 'Popular fill-ins',
    dotClassName: 'bg-accent-cheese-default',
  },
];

export const getCategory = (decision: Decision): ReasonCategory => {
  if (decision.lane === Lane.Popular) {
    return ReasonCategory.Popular;
  }
  if (decision.followedBy) {
    return ReasonCategory.Following;
  }
  return decision.best?.origin === InterestOrigin.Inferred
    ? ReasonCategory.Learned
    : ReasonCategory.Followed;
};

/** A topic's weight as the boost it gives a post, or No boost. */
export const formatBoost = (weight: number): string =>
  weight > 0 ? formatParam(ParamFormat.Boost, weight) : 'No boost';

export const getCategoryDot = (category: ReasonCategory): string =>
  reasonCategories.find((item) => item.category === category)?.dotClassName ??
  '';

const strengthPhrase: Partial<Record<Strength, string>> = {
  [Strength.Strong]: 'and read about it often',
  [Strength.Moderate]: 'and read about it sometimes',
  [Strength.Confirmed]: 'and read a post on it',
};

export interface ReasonParts {
  lead: string;
  name?: string;
  tail: string;
}

/** The one-sentence reason, split so the name can be bold. */
export const getReason = (
  decision: Decision,
  interests: Interest[],
): ReasonParts => {
  if (decision.lane === Lane.Popular) {
    return {
      lead: 'Popular this week.',
      tail: " Your topics didn't have enough new posts, so we added it.",
    };
  }
  const { best } = decision;
  const interest = interests.find(({ tag }) => tag === best?.tag);
  if (decision.followedBy === FollowKind.Source) {
    return {
      lead: 'You follow ',
      name: decision.post.source?.name,
      tail: best ? `. It's also about #${best.tag}.` : '.',
    };
  }
  if (decision.followedBy === FollowKind.Author) {
    return { lead: 'Written by someone you follow', tail: '.' };
  }
  if (!best) {
    return { lead: 'Picked for you', tail: '.' };
  }
  const name = `#${best.tag}`;
  const isStrong = interest?.strength === Strength.Strong;
  if (
    best.origin === InterestOrigin.Inferred &&
    !interest?.evidence &&
    interest?.control?.weight !== undefined
  ) {
    const boost = formatBoost(interest.weight);
    return best.role === TopicRole.Side
      ? { lead: 'Partly about ', name, tail: `. You gave it a ${boost} boost.` }
      : { lead: 'You gave ', name, tail: ` a ${boost} boost.` };
  }
  if (best.origin === InterestOrigin.Declared) {
    const phrase = interest?.strength ? strengthPhrase[interest.strength] : '';
    const follow = `${phrase ? ` ${phrase}` : ''}.`;
    return best.role === TopicRole.Side
      ? { lead: 'Partly about ', name, tail: `. You follow it${follow}` }
      : { lead: 'You follow ', name, tail: follow };
  }
  if (best.role === TopicRole.Side) {
    return {
      lead: 'Partly about ',
      name,
      tail: isStrong
        ? ". You've read a lot about it."
        : ". You've read a few posts on it.",
    };
  }
  return isStrong
    ? { lead: "You've read a lot about ", name, tail: '.' }
    : { lead: "You've read a few posts about ", name, tail: '.' };
};

/** Why a card on screen would leave, in the viewer's terms. */
export const getLeaveMessage = (
  served: Decision,
  now: Decision,
  state: PersonalizationState,
  clock = storyNow,
): string => {
  const sourceName = served.post.source?.name ?? 'this source';
  const until = (key: string) => {
    const time = state.expiries?.[key];
    return time ? ` ${formatUntil(time, clock)}` : '';
  };
  switch (now.exclusion) {
    case Exclusion.Hidden: {
      const main = served.post.tags?.[0];
      return main && state.controls[main]?.mode === TopicMode.Demoted
        ? `You asked for fewer like this, and less #${main}${until(
            expiryKey.topic(main),
          )}.`
        : 'You asked for fewer posts like this.';
    }
    case Exclusion.BlockedSource:
      return `You blocked ${sourceName}${until(
        expiryKey.blockedSource(served.post.source?.id ?? ''),
      )}.`;
    case Exclusion.BlockedAuthor:
      return 'You blocked its author.';
    case Exclusion.BlockedTag:
      return `You blocked #${now.exclusionTag}${until(
        expiryKey.blockedTag(now.exclusionTag ?? ''),
      )}.`;
    case Exclusion.BlockedCuration:
      return `You hid ${getCuration(now.exclusionCuration ?? '').title}${until(
        expiryKey.curation(now.exclusionCuration ?? ''),
      )}, and you don't follow where it's from.`;
    case Exclusion.TooOld:
      return `Older than your ${state.params['feed.max_candidate_age_days']}-day limit.`;
    case Exclusion.ShownTooOften:
      return `You scrolled past it ${now.impressions} times.`;
    case Exclusion.SideTopicsOff:
      return 'You turned off posts that are only partly about your topics.';
    case Exclusion.SideTopicUnproven:
      return "It's only partly about your topics and hasn't caught on with readers yet.";
    case Exclusion.PopularFillOff:
      return 'You turned off topping up your feed with popular posts.';
    default: {
      const tag = served.best?.tag;
      if (tag && state.controls[tag]?.weight === 0) {
        return `You took away #${tag}'s boost.`;
      }
      if (tag && state.controls[tag]?.mode === TopicMode.StopLearning) {
        return `You stopped learning #${tag} from your reading.`;
      }
      if (tag && !state.isLearning) {
        return 'You turned off learning from your reading.';
      }
      if (served.followedBy && !now.followedBy) {
        return `You unfollowed ${sourceName}.`;
      }
      if (tag && served.best?.origin === InterestOrigin.Declared) {
        return `You unfollowed #${tag}.`;
      }
      return 'None of its topics are in your interests anymore.';
    }
  }
};
