import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { AnnouncementCarousel } from '../announcements/AnnouncementCarousel';
import type { AnnouncementItem } from '../announcements/types';
import { useSidebarAnnouncements } from '../../hooks/useSidebarAnnouncements';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureSidebarAnnouncements } from '../../lib/featureManagement';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

interface SidebarAnnouncementsProps {
  className?: string;
}

export function SidebarAnnouncements({
  className,
}: SidebarAnnouncementsProps): ReactElement | null {
  const { logEvent } = useLogContext();
  const { items, dismiss, isReady } = useSidebarAnnouncements();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureSidebarAnnouncements,
    shouldEvaluate: isReady && items.length > 0,
  });

  // Wrap each CTA so its click is logged before navigation runs.
  const loggedItems = useMemo<AnnouncementItem[]>(
    () =>
      items.map((item) => {
        if (!item.cta) {
          return item;
        }

        return {
          ...item,
          cta: {
            ...item.cta,
            onClick: () => {
              logEvent({
                event_name: LogEvent.ClickAnnouncement,
                target_id: item.id,
              });
              item.cta?.onClick?.();
            },
          },
        };
      }),
    [items, logEvent],
  );

  if (!isReady || !isEnabled || loggedItems.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <AnnouncementCarousel
        items={loggedItems}
        onView={(item) =>
          logEvent({
            event_name: LogEvent.ImpressionAnnouncement,
            target_id: item.id,
          })
        }
        onItemClick={(item) =>
          logEvent({
            event_name: LogEvent.ClickAnnouncement,
            target_id: item.id,
          })
        }
        onDismiss={(id) => {
          logEvent({
            event_name: LogEvent.DismissAnnouncement,
            target_id: id,
          });
          dismiss(id);
        }}
      />
    </div>
  );
}

export default SidebarAnnouncements;
