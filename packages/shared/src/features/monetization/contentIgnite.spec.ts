/* eslint-disable no-underscore-dangle -- __ciads is Content Ignite's mandated global */
import { LogEvent } from '../../lib/log';
import { AdActions } from '../../lib/ads';
import {
  CONTENT_IGNITE_TAG_SRC,
  injectContentIgniteTag,
  reloadContentIgnite,
  setContentIgniteUtmTargeting,
  subscribeContentIgniteEvents,
  toAdSlotLogEvent,
} from './contentIgnite';

const tagScripts = (): HTMLScriptElement[] =>
  Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      `script[src="${CONTENT_IGNITE_TAG_SRC}"]`,
    ),
  );

afterEach(() => {
  tagScripts().forEach((script) => script.remove());
  delete window.__ciads;
});

describe('injectContentIgniteTag', () => {
  it('loads the per-domain tag once, async, however many pages ask', () => {
    injectContentIgniteTag();
    injectContentIgniteTag();

    expect(tagScripts()).toHaveLength(1);
    expect(tagScripts()[0].async).toBe(true);
    expect(tagScripts()[0].parentElement).toBe(document.head);
  });
});

describe('the command queue', () => {
  it('queues a reload until the tag has executed, then runs it', () => {
    reloadContentIgnite();

    expect(window.__ciads?.cmd).toHaveLength(1);

    const reload = jest.fn();
    window.__ciads!.reload = reload;
    window.__ciads!.cmd.forEach((command) => command());

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('hands the acquisition source over as page-level key-values', () => {
    setContentIgniteUtmTargeting({ source: 'newsletter', medium: 'email' });
    const setTargeting = jest.fn();
    window.__ciads!.setTargeting = setTargeting;

    window.__ciads!.cmd.forEach((command) => command());

    expect(setTargeting).toHaveBeenCalledWith('utm_source', ['newsletter']);
    expect(setTargeting).toHaveBeenCalledWith('utm_medium', ['email']);
    expect(setTargeting).toHaveBeenCalledTimes(2);
  });

  it('queues nothing without an acquisition source', () => {
    setContentIgniteUtmTargeting(undefined);

    expect(window.__ciads).toBeUndefined();
  });
});

describe('toAdSlotLogEvent', () => {
  const served = {
    config_id: 42,
    slot: { creativeId: 7, lineItemId: 8, size: '300x250' },
  };

  it('logs a fill with what the served creative was, under the auction-era name', () => {
    const event = toAdSlotLogEvent('ci_al', served, { source: 'newsletter' });

    expect(event.event_name).toBe(LogEvent.FillAdSlot);
    expect(JSON.parse(event.extra as string)).toMatchObject({
      provider: 'contentignite',
      config_id: 42,
      creative_id: 7,
      line_item_id: 8,
      creative_size: '300x250',
      utm_source: 'newsletter',
    });
  });

  it('separates a miss from a consent refusal by reason', () => {
    const miss = toAdSlotLogEvent('ci_am', { config_id: 42, msg: 'no fill' });
    const denied = toAdSlotLogEvent('ci_cd', { config_id: 42 });

    expect(miss.event_name).toBe(LogEvent.EmptyAdSlot);
    expect(JSON.parse(miss.extra as string).reason).toBe('no fill');
    expect(denied.event_name).toBe(LogEvent.EmptyAdSlot);
    expect(JSON.parse(denied.extra as string).reason).toBe('consent_denied');
  });

  it('logs the viewable impression in the internal ads shape, creative as target', () => {
    const event = toAdSlotLogEvent('ci_ai', served);

    expect(event).toMatchObject({
      event_name: AdActions.Viewable,
      target_type: 'ad',
      target_id: '7',
      ad_provider_id: 'contentignite',
    });
  });

  it('falls back to the unit config as the target when no creative is reported', () => {
    expect(toAdSlotLogEvent('ci_ai', { config_id: 42 }).target_id).toBe('42');
  });

  it('logs a tag error apart from an empty unit', () => {
    const event = toAdSlotLogEvent('ci_te', { msg: 'boom' });

    expect(event.event_name).toBe(LogEvent.AdSlotError);
    expect(JSON.parse(event.extra as string).error_type).toBe('boom');
  });
});

describe('subscribeContentIgniteEvents', () => {
  it('forwards the tag events it is subscribed to and stops on unsubscribe', () => {
    const onEvent = jest.fn();
    const unsubscribe = subscribeContentIgniteEvents(onEvent);

    window.dispatchEvent(
      new CustomEvent('ci_am', { detail: { config_id: 1, msg: 'no fill' } }),
    );
    window.dispatchEvent(new CustomEvent('ci_pi'));

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent.mock.calls[0][0].event_name).toBe(LogEvent.EmptyAdSlot);

    unsubscribe();
    window.dispatchEvent(new CustomEvent('ci_am', { detail: {} }));

    expect(onEvent).toHaveBeenCalledTimes(1);
  });
});
