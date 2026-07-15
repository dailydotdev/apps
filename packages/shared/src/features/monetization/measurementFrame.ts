import type { AdMeasurementTag } from '../../graphql/posts';
import { webappUrl } from '../../lib/constants';

/**
 * postMessage contract between the extension new-tab (parent) and the
 * measurement embed page, which runs the tags on the extension's behalf.
 * Macro substitution runs inside the frame, so fixes ship with a webapp
 * deploy instead of waiting for extension-store adoption.
 *
 * Handshake: the frame posts `ready` as soon as its listener is attached; the
 * parent replies with `init`. This avoids the race where the parent posts
 * before the frame can receive.
 */

export const measurementFramePath = 'embed/mf';

export const getMeasurementFrameUrl = (): string =>
  `${webappUrl}${measurementFramePath}`;

export const measurementFrameSource = 'dd-mf-frame';
export const measurementParentSource = 'dd-mf-parent';

export interface MeasurementReadyMessage {
  source: typeof measurementFrameSource;
  type: 'ready';
}

export interface MeasurementInitMessage {
  source: typeof measurementParentSource;
  type: 'init';
  tags: AdMeasurementTag[];
  // Resolved by the parent from the user's consent state; when true the frame
  // emits gdpr=1 and the tags skip measurement.
  gdprApplies?: boolean;
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
