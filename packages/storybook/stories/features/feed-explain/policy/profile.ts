import type { ParamValues } from './params';

/**
 * The inferred profile as daily-feed stores it (`services/inferred_interests`):
 * per topic, the distinct stories with a positive action in the last 90 days,
 * how many of them were upvoted, saved, commented on or shared, and when the
 * latest action was. Labels and weights are computed per request.
 */
export interface TopicEvidence {
  topic: string;
  stories: number;
  strongStories: number;
  daysSinceLastAction: number;
}

export enum Strength {
  Strong = 'strong',
  Moderate = 'moderate',
  Confirmed = 'confirmed',
  EarlySignal = 'early_signal',
}

export enum InterestOrigin {
  Declared = 'declared',
  Inferred = 'inferred',
}

/** Proposed per-topic user controls; the policy has the knobs, not the UI. */
export enum TopicMode {
  Boosted = 'boosted',
  Demoted = 'demoted',
  NotInterested = 'not_interested',
}

export interface TopicControl {
  mode?: TopicMode;
  /** An exact weight the user set, replacing the computed one. */
  weight?: number;
}

export interface Interest {
  tag: string;
  origin: InterestOrigin;
  strength?: Strength;
  evidence?: TopicEvidence;
  recency: number;
  /** The policy's weight before the user's control. */
  computedWeight: number;
  weight: number;
  control?: TopicControl;
  /** Has reading behind it, so it can take a rotation turn. */
  isBacked: boolean;
}

/** The most an exact topic weight can be set to. */
export const maxTopicWeight = 1.5;

const strongMinStories = 6;
const moderateMinStories = 2;

export const getStrength = (
  evidence: TopicEvidence | undefined,
  isDeclared: boolean,
): Strength | undefined => {
  if (!evidence || evidence.stories < 1) {
    return undefined;
  }
  if (evidence.stories >= strongMinStories) {
    return Strength.Strong;
  }
  if (evidence.stories >= moderateMinStories) {
    return Strength.Moderate;
  }
  return isDeclared ? Strength.Confirmed : Strength.EarlySignal;
};

export const getRecency = (days: number, params: ParamValues): number =>
  Math.max(
    params['interests.inferred_recency_floor'],
    Math.min(
      1,
      0.5 ** (days / params['interests.inferred_recency_half_life_days']),
    ),
  );

export const strengthLabel: Record<Strength, string> = {
  [Strength.Strong]: 'Strong',
  [Strength.Moderate]: 'Moderate',
  [Strength.Confirmed]: 'Confirmed',
  [Strength.EarlySignal]: 'Early signal',
};

export const strengthRule: Record<Strength, string> = {
  [Strength.Strong]: '6 or more stories',
  [Strength.Moderate]: '2 to 5 stories',
  [Strength.Confirmed]: '1 story on a topic you follow',
  [Strength.EarlySignal]: '1 story; counts once there are 2',
};

interface BuildInterestsInput {
  followedTags: string[];
  blockedTags: string[];
  evidence: TopicEvidence[];
  controls: Record<string, TopicControl>;
  isLearning: boolean;
  params: ParamValues;
}

const declaredBoost = (strength: Strength, params: ParamValues): number => {
  switch (strength) {
    case Strength.Strong:
      return params['interests.declared_boost.strong'];
    case Strength.Moderate:
      return params['interests.declared_boost.moderate'];
    case Strength.Confirmed:
      return params['interests.declared_boost.confirmed'];
    default:
      return 0;
  }
};

const inferredWeight = (strength: Strength, params: ParamValues): number => {
  switch (strength) {
    case Strength.Strong:
      return params['interests.inferred_weight.strong'];
    case Strength.Moderate:
      return params['interests.inferred_weight.moderate'];
    default:
      return 0;
  }
};

const applyControl = (
  weight: number,
  control: TopicControl | undefined,
  params: ParamValues,
): number => {
  if (control?.weight !== undefined) {
    return control.weight;
  }
  switch (control?.mode) {
    case TopicMode.Boosted:
      return weight * params['interests.control_boost'];
    case TopicMode.Demoted:
      return weight * params['interests.control_demote'];
    case TopicMode.NotInterested:
      return 0;
    default:
      return weight;
  }
};

/**
 * `BuildInterests` from daily-feed's challenger policy, plus the controls its
 * proof of concept defined: boosted and demoted multiply the weight, not
 * interested drops it.
 */
export const buildInterests = ({
  followedTags,
  blockedTags,
  evidence,
  controls,
  isLearning,
  params,
}: BuildInterestsInput): Interest[] => {
  const evidenceByTopic = new Map(
    (isLearning ? evidence : []).map((item) => [item.topic, item]),
  );
  const tags = [
    ...new Set([
      ...followedTags,
      ...evidenceByTopic.keys(),
      ...Object.keys(controls).filter(
        (tag) => controls[tag].weight !== undefined,
      ),
    ]),
  ].filter((tag) => !blockedTags.includes(tag));

  return tags.map((tag): Interest => {
    const isDeclared = followedTags.includes(tag);
    const topicEvidence = evidenceByTopic.get(tag);
    const strength = getStrength(topicEvidence, isDeclared);
    const recency = topicEvidence
      ? getRecency(topicEvidence.daysSinceLastAction, params)
      : 1;
    const computedWeight = isDeclared
      ? params['interests.base_weight'] +
        (strength ? declaredBoost(strength, params) * recency : 0)
      : (strength ? inferredWeight(strength, params) : 0) * recency;
    const control = controls[tag];

    return {
      tag,
      origin: isDeclared ? InterestOrigin.Declared : InterestOrigin.Inferred,
      strength,
      evidence: topicEvidence,
      recency,
      computedWeight,
      weight: Math.max(0, applyControl(computedWeight, control, params)),
      control,
      isBacked:
        !!strength && strength !== Strength.EarlySignal && !!topicEvidence,
    };
  });
};

/** The interests the policy actually ranks with. */
export const getActiveInterests = (interests: Interest[]): Interest[] =>
  interests.filter(({ weight }) => weight > 0);
