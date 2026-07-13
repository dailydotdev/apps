import type { AdMeasurementTag } from '../../graphql/posts';
import type { AdMacroContext } from './adMacros';
import { webappUrl } from '../../lib/constants';

/**
 * postMessage contract between the extension new-tab (parent) and the
 * web-origin measurement frame. The frame runs the JS measurement tags that the
 * extension's MV3 CSP forbids on its own page. The discriminators live only in
 * message payloads (never in the URL) so ad blockers cannot key on them.
 *
 * Handshake: the frame posts `ready` as soon as its listener is attached; the
 * parent replies with `init` carrying the tags + resolved consent + theme. This
 * avoids the race where the parent posts before the frame can receive.
 */

// Neutral, no "ad"/"measurement" tokens: the path is visible to ad blockers.
export const measurementFramePath = 'mf';

export const getMeasurementFrameUrl = (): string =>
  `${webappUrl}${measurementFramePath}`;

export const measurementFrameSource = 'dd-mf-frame';
export const measurementParentSource = 'dd-mf-parent';

export type MeasurementTheme = 'light' | 'dark';

export interface MeasurementReadyMessage {
  source: typeof measurementFrameSource;
  type: 'ready';
}

export interface MeasurementInitMessage {
  source: typeof measurementParentSource;
  type: 'init';
  tags: AdMeasurementTag[];
  ctx: AdMacroContext;
  theme: MeasurementTheme;
}

export const isMeasurementReadyMessage = (
  data: unknown,
): data is MeasurementReadyMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as MeasurementReadyMessage).source === measurementFrameSource &&
  (data as MeasurementReadyMessage).type === 'ready';

export const isMeasurementInitMessage = (
  data: unknown,
): data is MeasurementInitMessage =>
  !!data &&
  typeof data === 'object' &&
  (data as MeasurementInitMessage).source === measurementParentSource &&
  (data as MeasurementInitMessage).type === 'init' &&
  Array.isArray((data as MeasurementInitMessage).tags);
