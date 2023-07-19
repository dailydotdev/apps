/* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle, @typescript-eslint/no-use-before-define, no-param-reassign, no-multi-assign, @typescript-eslint/no-shadow, no-continue, @typescript-eslint/explicit-module-boundary-types, no-console */

import type {
  Context,
  Experiment,
  FeatureResult,
  Result,
  SubscriptionFunction,
  FeatureDefinition,
  FeatureResultSource,
  Attributes,
  WidenPrimitives,
  VariationMeta,
  Filter,
  VariationRange,
} from './types/growthbook';
import type { ConditionInterface } from './types/mongrule';
import {
  getUrlRegExp,
  isIncluded,
  getBucketRanges,
  hash,
  chooseVariation,
  getQueryStringOverride,
  inNamespace,
  inRange,
  isURLTargeted,
} from './util';
import { evalCondition } from './mongrule';

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

export class GrowthBook<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AppFeatures extends Record<string, any> = Record<string, any>,
> {
  // context is technically private, but some tools depend on it so we can't mangle the name
  // _ctx below is a clone of this property that we use internally
  private context: Context;

  public debug: boolean;

  public ready: boolean;

  // Properties and methods that start with "_" are mangled by Terser (saves ~150 bytes)
  private _ctx: Context;

  private _renderer: null | (() => void);

  private _trackedExperiments: Set<unknown>;

  private _trackedFeatures: Record<string, string>;

  private _subscriptions: Set<SubscriptionFunction>;

  private _assigned: Map<
    string,
    {
      // eslint-disable-next-line
      experiment: Experiment<any>;
      // eslint-disable-next-line
      result: Result<any>;
    }
  >;
  // eslint-disable-next-line
  private _forcedFeatureValues: Map<string, any>;

  private _attributeOverrides: Attributes;

  constructor(context?: Context) {
    context = context || {};
    // These properties are all initialized in the constructor instead of above
    // This saves ~80 bytes in the final output
    this._ctx = this.context = context;
    this._renderer = null;
    this._trackedExperiments = new Set();
    this._trackedFeatures = {};
    this.debug = false;
    this._subscriptions = new Set();
    this.ready = false;
    this._assigned = new Map();
    this._forcedFeatureValues = new Map();
    this._attributeOverrides = {};

    if (context.features) {
      this.ready = true;
    }

    if (isBrowser && context.enableDevMode) {
      window._growthbook = this;
      document.dispatchEvent(new Event('gbloaded'));
    }
  }

  private _render() {
    if (this._renderer) {
      this._renderer();
    }
  }

  public setFeatures(features: Record<string, FeatureDefinition>) {
    this._ctx.features = features;
    this.ready = true;
    this._render();
  }

  public setAttributes(attributes: Attributes) {
    this._ctx.attributes = attributes;
    this._render();
  }

  public setAttributeOverrides(overrides: Attributes) {
    this._attributeOverrides = overrides;
    this._render();
  }

  public setForcedVariations(vars: Record<string, number>) {
    this._ctx.forcedVariations = vars || {};
    this._render();
  }

  // eslint-disable-next-line
  public setForcedFeatures(map: Map<string, any>) {
    this._forcedFeatureValues = map;
    this._render();
  }

  public getAttributes() {
    return { ...this._ctx.attributes, ...this._attributeOverrides };
  }

  public getFeatures() {
    return this._ctx.features || {};
  }

  public getAllResults() {
    return new Map(this._assigned);
  }

  public destroy() {
    // Release references to save memory
    this._subscriptions.clear();
    this._assigned.clear();
    this._trackedExperiments.clear();
    this._trackedFeatures = {};

    if (isBrowser && window._growthbook === this) {
      delete window._growthbook;
    }
  }

  public setRenderer(renderer: () => void) {
    this._renderer = renderer;
  }

  public forceVariation(key: string, variation: number) {
    this._ctx.forcedVariations = this._ctx.forcedVariations || {};
    this._ctx.forcedVariations[key] = variation;
    this._render();
  }

  public run<T>(experiment: Experiment<T>): Result<T> {
    const result = this._run(experiment, null);
    this._fireSubscriptions(experiment, result);
    return result;
  }

  private _fireSubscriptions<T>(experiment: Experiment<T>, result: Result<T>) {
    const { key } = experiment;

    // If assigned variation has changed, fire subscriptions
    const prev = this._assigned.get(key);
    // TODO: what if the experiment definition has changed?
    if (
      !prev ||
      prev.result.inExperiment !== result.inExperiment ||
      prev.result.variationId !== result.variationId
    ) {
      this._assigned.set(key, { experiment, result });
      this._subscriptions.forEach((cb) => {
        try {
          cb(experiment, result);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  private _trackFeatureUsage(key: string, res: FeatureResult): void {
    // Don't track feature usage that was forced via an override
    if (res.source === 'override') return;

    // Only track a feature once, unless the assigned value changed
    const stringifiedValue = JSON.stringify(res.value);
    if (this._trackedFeatures[key] === stringifiedValue) return;
    this._trackedFeatures[key] = stringifiedValue;

    // Fire user-supplied callback
    if (this._ctx.onFeatureUsage) {
      try {
        this._ctx.onFeatureUsage(key, res);
      } catch (e) {
        // Ignore feature usage callback errors
      }
    }
  }

  private _getFeatureResult<T>(
    key: string,
    value: T,
    source: FeatureResultSource,
    ruleId?: string,
    experiment?: Experiment<T>,
    result?: Result<T>,
  ): FeatureResult<T> {
    const ret: FeatureResult = {
      value,
      on: !!value,
      off: !value,
      source,
      ruleId: ruleId || '',
    };
    if (experiment) ret.experiment = experiment;
    if (result) ret.experimentResult = result;

    // Track the usage of this feature in real-time
    this._trackFeatureUsage(key, ret);

    return ret;
  }

  public isOn<K extends string & keyof AppFeatures = string>(key: K): boolean {
    return this.evalFeature(key).on;
  }

  public isOff<K extends string & keyof AppFeatures = string>(key: K): boolean {
    return this.evalFeature(key).off;
  }

  public getFeatureValue<
    V extends AppFeatures[K],
    K extends string & keyof AppFeatures = string,
  >(key: K, defaultValue: V): WidenPrimitives<V> {
    const { value } = this.evalFeature<WidenPrimitives<V>, K>(key);
    return value === null ? (defaultValue as WidenPrimitives<V>) : value;
  }

  /**
   * @deprecated Use {@link evalFeature}
   * @param id
   */
  // eslint-disable-next-line
  public feature<V extends AppFeatures[K],
    K extends string & keyof AppFeatures = string,
  >(id: K): FeatureResult<V | null> {
    return this.evalFeature(id);
  }

  public evalFeature<
    V extends AppFeatures[K],
    K extends string & keyof AppFeatures = string,
  >(id: K): FeatureResult<V | null> {
    // Global override
    if (this._forcedFeatureValues.has(id)) {
      return this._getFeatureResult(
        id,
        this._forcedFeatureValues.get(id),
        'override',
      );
    }

    // Unknown feature id
    if (!this._ctx.features || !this._ctx.features[id]) {
      return this._getFeatureResult(id, null, 'unknownFeature');
    }

    // Get the feature
    const feature: FeatureDefinition<V> = this._ctx.features[id];

    // Loop through the rules
    if (feature.rules) {
      for (let i = 0; i < feature.rules.length; i += 1) {
        const rule = feature.rules[i];
        // If it's a conditional rule, skip if the condition doesn't pass
        if (rule.condition && !this._conditionPasses(rule.condition)) {
          continue;
        }
        // If there are filters for who is included (e.g. namespaces)
        if (rule.filters && this._isFilteredOut(rule.filters)) {
          continue;
        }

        // Feature value is being forced
        if ('force' in rule) {
          // If this is a percentage rollout, skip if not included
          if (
            !this._isIncludedInRollout(
              rule.seed || id,
              rule.hashAttribute,
              rule.range,
              rule.coverage,
              rule.hashVersion,
            )
          ) {
            continue;
          }

          // If this was a remotely evaluated experiment, fire the tracking callbacks
          if (rule.tracks) {
            rule.tracks.forEach((t) => {
              this._track(t.experiment, t.result);
            });
          }

          return this._getFeatureResult(id, rule.force as V, 'force', rule.id);
        }
        if (!rule.variations) {
          continue;
        }
        // For experiment rules, run an experiment
        const exp: Experiment<V> = {
          variations: rule.variations as [V, V, ...V[]],
          key: rule.key || id,
        };
        if ('coverage' in rule) exp.coverage = rule.coverage;
        if (rule.weights) exp.weights = rule.weights;
        if (rule.hashAttribute) exp.hashAttribute = rule.hashAttribute;
        if (rule.namespace) exp.namespace = rule.namespace;
        if (rule.meta) exp.meta = rule.meta;
        if (rule.ranges) exp.ranges = rule.ranges;
        if (rule.name) exp.name = rule.name;
        if (rule.phase) exp.phase = rule.phase;
        if (rule.seed) exp.seed = rule.seed;
        if (rule.hashVersion) exp.hashVersion = rule.hashVersion;
        if (rule.filters) exp.filters = rule.filters;

        // Only return a value if the user is part of the experiment
        const res = this._run(exp, id);
        this._fireSubscriptions(exp, res);
        if (res.inExperiment && !res.passthrough) {
          return this._getFeatureResult(
            id,
            res.value,
            'experiment',
            rule.id,
            exp,
            res,
          );
        }
      }
    }

    // Fall back to using the default value
    return this._getFeatureResult(
      id,
      feature.defaultValue === undefined ? null : feature.defaultValue,
      'defaultValue',
    );
  }

  private _isIncludedInRollout(
    seed: string,
    hashAttribute: string | undefined,
    range: VariationRange | undefined,
    coverage: number | undefined,
    hashVersion: number | undefined,
  ): boolean {
    if (!range && coverage === undefined) return true;

    const { hashValue } = this._getHashAttribute(hashAttribute);
    if (!hashValue) {
      return false;
    }

    const n = hash(seed, hashValue, hashVersion || 1);
    if (n === null) return false;

    // eslint-disable-next-line no-nested-ternary
    return range
      ? inRange(n, range)
      : coverage !== undefined
      ? n <= coverage
      : true;
  }

  private _conditionPasses(condition: ConditionInterface): boolean {
    return evalCondition(this.getAttributes(), condition);
  }

  private _isFilteredOut(filters: Filter[]): boolean {
    return filters.some((filter) => {
      const { hashValue } = this._getHashAttribute(filter.attribute);
      if (!hashValue) return true;
      const n = hash(filter.seed, hashValue, filter.hashVersion || 2);
      if (n === null) return true;
      return !filter.ranges.some((r) => inRange(n, r));
    });
  }

  private _run<T>(
    experiment: Experiment<T>,
    featureId: string | null,
  ): Result<T> {
    const { key } = experiment;
    const numVariations = experiment.variations.length;

    // 1. If experiment has less than 2 variations, return immediately
    if (numVariations < 2) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 2. If the context is disabled, return immediately
    if (this._ctx.enabled === false) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 2.5. Merge in experiment overrides from the context
    experiment = this._mergeOverrides(experiment);

    // 3. If a variation is forced from a querystring, return the forced variation
    const qsOverride = getQueryStringOverride(
      key,
      this._getContextUrl(),
      numVariations,
    );
    if (qsOverride !== null) {
      return this._getResult(experiment, qsOverride, false, featureId);
    }

    // 4. If a variation is forced in the context, return the forced variation
    if (this._ctx.forcedVariations && key in this._ctx.forcedVariations) {
      const variation = this._ctx.forcedVariations[key];
      return this._getResult(experiment, variation, false, featureId);
    }

    // 5. Exclude if a draft experiment or not active
    if (experiment.status === 'draft' || experiment.active === false) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 6. Get the hash attribute and return if empty
    const { hashValue } = this._getHashAttribute(experiment.hashAttribute);
    if (!hashValue) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 7. Exclude if user is filtered out (used to be called "namespace")
    if (experiment.filters) {
      if (this._isFilteredOut(experiment.filters)) {
        return this._getResult(experiment, -1, false, featureId);
      }
    } else if (
      experiment.namespace &&
      !inNamespace(hashValue, experiment.namespace)
    ) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 7.5. Exclude if experiment.include returns false or throws
    if (experiment.include && !isIncluded(experiment.include)) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 8. Exclude if condition is false
    if (experiment.condition && !this._conditionPasses(experiment.condition)) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 8.1. Exclude if user is not in a required group
    if (
      experiment.groups &&
      !this._hasGroupOverlap(experiment.groups as string[])
    ) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 8.2. Old style URL targeting
    if (experiment.url && !this._urlIsValid(experiment.url as RegExp)) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 8.3. New, more powerful URL targeting
    if (
      experiment.urlPatterns &&
      !isURLTargeted(this._getContextUrl(), experiment.urlPatterns)
    ) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 9. Get bucket ranges and choose variation
    const n = hash(
      experiment.seed || key,
      hashValue,
      experiment.hashVersion || 1,
    );
    if (n === null) {
      return this._getResult(experiment, -1, false, featureId);
    }

    const ranges =
      experiment.ranges ||
      getBucketRanges(
        numVariations,
        experiment.coverage === undefined ? 1 : experiment.coverage,
        experiment.weights,
      );

    const assigned = chooseVariation(n, ranges);

    // 10. Return if not in experiment
    if (assigned < 0) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 11. Experiment has a forced variation
    if ('force' in experiment) {
      return this._getResult(
        experiment,
        experiment.force === undefined ? -1 : experiment.force,
        false,
        featureId,
      );
    }

    // 12. Exclude if in QA mode
    if (this._ctx.qaMode) {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 12.5. Exclude if experiment is stopped
    if (experiment.status === 'stopped') {
      return this._getResult(experiment, -1, false, featureId);
    }

    // 13. Build the result object
    const result = this._getResult(experiment, assigned, true, featureId, n);

    // 14. Fire the tracking callback
    this._track(experiment, result);

    // 15. Return the result
    return result;
  }

  log(msg: string, ctx: Record<string, unknown>) {
    if (!this.debug) return;
    if (this._ctx.log) this._ctx.log(msg, ctx);
    else console.log(msg, ctx);
  }

  private _track<T>(experiment: Experiment<T>, result: Result<T>) {
    if (!this._ctx.trackingCallback) return;

    const { key } = experiment;

    // Make sure a tracking callback is only fired once per unique experiment
    const k =
      result.hashAttribute + result.hashValue + key + result.variationId;
    if (this._trackedExperiments.has(k)) return;
    this._trackedExperiments.add(k);

    try {
      this._ctx.trackingCallback(experiment, result);
    } catch (e) {
      console.error(e);
    }
  }

  private _mergeOverrides<T>(experiment: Experiment<T>): Experiment<T> {
    const { key } = experiment;
    const o = this._ctx.overrides;
    if (o && o[key]) {
      experiment = { ...experiment, ...(o[key] as Experiment<T>) };
      if (typeof experiment.url === 'string') {
        experiment.url = getUrlRegExp(
          // eslint-disable-next-line
          experiment.url as any,
        );
      }
    }

    return experiment;
  }

  private _getHashAttribute(attr?: string) {
    const hashAttribute = attr || 'id';

    let hashValue = '';
    if (this._attributeOverrides[hashAttribute]) {
      hashValue = this._attributeOverrides[hashAttribute];
    } else if (this._ctx.attributes) {
      hashValue = this._ctx.attributes[hashAttribute] || '';
    } else if (this._ctx.user) {
      hashValue = this._ctx.user[hashAttribute] || '';
    }

    return { hashAttribute, hashValue };
  }

  private _getResult<T>(
    experiment: Experiment<T>,
    variationIndex: number,
    hashUsed: boolean,
    featureId: string | null,
    bucket?: number,
  ): Result<T> {
    let inExperiment = true;
    // If assigned variation is not valid, use the baseline and mark the user as not in the experiment
    if (variationIndex < 0 || variationIndex >= experiment.variations.length) {
      variationIndex = 0;
      inExperiment = false;
    }

    const { hashAttribute, hashValue } = this._getHashAttribute(
      experiment.hashAttribute,
    );

    const meta: Partial<VariationMeta> = experiment.meta
      ? experiment.meta[variationIndex]
      : {};

    const res: Result<T> = {
      key: meta.key || `${variationIndex}`,
      featureId,
      inExperiment,
      hashUsed,
      variationId: variationIndex,
      value: experiment.variations[variationIndex],
      hashAttribute,
      hashValue,
    };

    if (meta.name) res.name = meta.name;
    if (bucket !== undefined) res.bucket = bucket;
    if (meta.passthrough) res.passthrough = meta.passthrough;

    return res;
  }

  private _getContextUrl() {
    return this._ctx.url || (isBrowser ? window.location.href : '');
  }

  private _urlIsValid(urlRegex: RegExp): boolean {
    const url = this._getContextUrl();
    if (!url) return false;

    const pathOnly = url.replace(/^https?:\/\//, '').replace(/^[^/]*\//, '/');

    if (urlRegex.test(url)) return true;
    if (urlRegex.test(pathOnly)) return true;
    return false;
  }

  private _hasGroupOverlap(expGroups: string[]): boolean {
    const groups = this._ctx.groups || {};
    for (let i = 0; i < expGroups.length; i += 1) {
      if (groups[expGroups[i]]) return true;
    }
    return false;
  }
}
