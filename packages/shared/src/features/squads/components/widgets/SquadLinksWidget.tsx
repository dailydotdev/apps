import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { IconSize } from '../../../../components/Icon';
import { LinkIcon } from '../../../../components/icons';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import { SquadWidget } from './SquadWidget';
import { hasSquadFeature } from '../../lib/features';
import { getDisplayUrl, getSquadLinkMeta, squadLinkRel } from '../../lib/links';

interface SquadLinksWidgetProps {
  squad: Squad;
}

export const SquadLinksWidget = ({
  squad,
}: SquadLinksWidgetProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const links = squad.links ?? [];

  if (!hasSquadFeature(squad, 'links') || (!squad.website && !links.length)) {
    return null;
  }

  const onClick = (url: string) =>
    logEvent({
      event_name: LogEvent.ClickSquadLink,
      target_id: squad.id,
      extra: JSON.stringify({ url }),
    });

  const rows = [
    ...(squad.website
      ? [
          {
            url: squad.website,
            label: getDisplayUrl(squad.website),
            Icon: LinkIcon,
          },
        ]
      : []),
    ...links.map((url) => ({ url, ...getSquadLinkMeta(url) })),
  ];

  return (
    <SquadWidget title="Links">
      <ul className="mt-2 flex flex-col gap-1">
        {rows.map(({ url, label, Icon }) => (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel={squadLinkRel}
              onClick={() => onClick(url)}
              className="group flex items-center gap-2 py-1 text-text-secondary typo-callout hover:text-text-primary"
            >
              <span className="flex size-4 items-center justify-center text-text-tertiary group-hover:text-text-primary">
                <Icon size={IconSize.Size16} />
              </span>
              <span className="min-w-0 flex-1 truncate">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </SquadWidget>
  );
};
