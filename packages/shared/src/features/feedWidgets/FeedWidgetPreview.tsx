import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { getLogContextStatic } from '../../contexts/LogContext';
import type { LogContextData } from '../../hooks/log/useLogContextData';
import type { FeedWidget, FeedWidgetConfig, FeedWidgetSize } from './types';
import {
  FeedWidgetKind,
  feedWidgetSizeLabel,
  feedWidgetSizeSpan,
} from './types';
import { isFeedWidgetBare } from './registry';
import { getFeedWidgetComponent } from './components';
import { FeedWidgetSurface, useInertRef } from './FeedWidgetFrame';
import { RAIL_CELL_HEIGHT, RAIL_HEIGHT } from './FeedWidgetRailFrame';
import { FeedWidgetTip } from './widgets/FeedWidgetTip';
import type { FeedWidgetTip as FeedWidgetTipItem } from './tips';

// The rail's column, on a four-column feed, and its gap.
const PREVIEW_COLUMN = '17.25rem';
const PREVIEW_COLUMN_GAP = '1.5rem';

const noop = (): void => undefined;

// A preview is not a placement: what its posts and tips would log on the rail
// would count impressions nobody saw in the feed.
const previewLog: LogContextData = {
  logEvent: noop,
  logEventStart: noop,
  logEventEnd: noop,
  sendBeacon: noop,
};

/** The real widget, live and out of reach, scaled down to fit its stage. */
export const FeedWidgetPreview = ({
  kind,
  size,
  className,
}: {
  kind: FeedWidgetKind;
  size: FeedWidgetSize;
  className?: string;
}): ReactElement | null => {
  const { squads } = useAuthContext();
  const stageRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const Component = getFeedWidgetComponent(kind);
  const { cols, rows } = feedWidgetSizeSpan[size];
  const width = `calc(${cols} * ${PREVIEW_COLUMN} + ${
    cols - 1
  } * ${PREVIEW_COLUMN_GAP})`;
  const height = rows === 1 ? RAIL_CELL_HEIGHT : RAIL_HEIGHT;
  // Squad updates shows a squad the reader is in, as it will once picked.
  const widget = useMemo<FeedWidget>(
    () => ({
      id: `preview-${kind}`,
      kind,
      size,
      ...(kind === FeedWidgetKind.SquadUpdates &&
        squads?.[0] && {
          config: { sourceId: squads[0].id } as FeedWidgetConfig,
        }),
    }),
    [kind, size, squads],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const node = widgetRef.current;
    if (!stage || !node) {
      return undefined;
    }

    const fit = () => {
      const { offsetWidth, offsetHeight } = node;
      if (!offsetWidth || !offsetHeight) {
        return;
      }
      setScale(
        Math.min(
          1,
          stage.clientWidth / offsetWidth,
          stage.clientHeight / offsetHeight,
        ),
      );
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [size]);

  if (!Component) {
    return null;
  }

  const PreviewLogContext = getLogContextStatic();

  return (
    <div
      ref={stageRef}
      className={classNames(
        'flex min-h-0 min-w-0 items-center justify-center',
        className,
      )}
    >
      <div
        className="shrink-0"
        style={{
          width: `calc(${width} * ${scale})`,
          height: `calc(${height} * ${scale})`,
        }}
      >
        <div
          ref={widgetRef}
          role="group"
          aria-label={`${feedWidgetSizeLabel[size]} preview`}
          className="flex origin-top-left"
          style={{ width, height, transform: `scale(${scale})` }}
        >
          <PreviewLogContext.Provider value={previewLog}>
            <FeedWidgetSurface isBare={isFeedWidgetBare(kind, size)} isInert>
              <Component
                widget={widget}
                size={size}
                isEditing={false}
                onConfigChange={() => false}
                canConfigure={false}
                isConfiguring={false}
                onConfigureEnd={noop}
              />
            </FeedWidgetSurface>
          </PreviewLogContext.Provider>
        </div>
      </div>
    </div>
  );
};

export const TipsPreview = ({
  tip,
}: {
  tip: FeedWidgetTipItem;
}): ReactElement => {
  const ref = useInertRef<HTMLDivElement>(true);
  const PreviewLogContext = getLogContextStatic();

  return (
    <div ref={ref} className="w-full max-w-[17.25rem]">
      <PreviewLogContext.Provider value={previewLog}>
        <FeedWidgetTip tip={tip} isEditing />
      </PreviewLogContext.Provider>
    </div>
  );
};
