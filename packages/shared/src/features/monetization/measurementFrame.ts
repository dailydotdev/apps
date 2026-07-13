import type { AdMeasurementTag } from '../../graphql/posts';
import { webappUrl } from '../../lib/constants';

/**
 * postMessage contract between the extension new-tab (parent) and the
 * web-origin measurement frame. The frame runs the JS measurement tags that the
 * extension's MV3 CSP forbids on its own page. The discriminators live only in
 * message payloads (never in the URL) so ad blockers cannot key on them.
 *
 * The parent sends only plain data (raw tags, theme, the resolved gdpr
 * decision). Macro substitution (cachebuster, gdpr flag) runs inside the frame,
 * so it ships with a webapp deploy and never waits for extension-store adoption.
 *
 * Handshake: the frame posts `ready` as soon as its listener is attached; the
 * parent replies with `init`. This avoids the race where the parent posts
 * before the frame can receive.
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
  theme: MeasurementTheme;
  // Resolved from the user's first-party cookie choice by the parent: true only
  // when GDPR applies and the user has not consented (so the frame emits gdpr=1
  // and the vendor withholds measurement); false means measurement proceeds.
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
