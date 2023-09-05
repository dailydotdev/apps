import React, {
  MouseEventHandler,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import TimerIcon from '../icons/Timer';
import { SimpleTooltip } from '../tooltips';
import { Button, ButtonSize } from '../buttons/Button';
import { useSearchHistory } from '../../hooks/search';
import { ContextMenu, MenuItemProps } from '../fields/PortalMenu';
import useContextMenu from '../../hooks/useContextMenu';
import { getSearchUrl } from '../../graphql/search';
import { AnalyticsEvent } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';

const contextMenuId = 'search-history-input';

export function SearchHistoryButton(): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const {
    nodes,
    result: { isLoading },
  } = useSearchHistory({ limit: 3 });
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { onMenuClick, onHide } = useContextMenu({ id: contextMenuId });

  const getMessage = () => {
    if (isLoading) {
      return 'Loading your search queries...';
    }

    return nodes.length === 0
      ? 'Your search history is empty'
      : 'See search history';
  };

  const options = useMemo<MenuItemProps[]>(() => {
    if (!nodes.length) {
      return [];
    }

    const result = nodes.map(({ node }) => ({
      id: node.id,
      icon: <TimerIcon />,
      label: node.prompt,
      action: () => router.push(getSearchUrl({ id: node.id })),
    }));

    result.push({
      id: null,
      icon: null,
      label: 'Show all',
      action: () => {
        trackEvent({ event_name: AnalyticsEvent.OpenSearchHistory });

        return router.push(
          `${process.env.NEXT_PUBLIC_WEBAPP_URL}history?t=Search%20history`,
        );
      },
    });

    return result;
  }, [trackEvent, router, nodes]);

  const onMenuOpen: MouseEventHandler = (event) => {
    const command = isMenuOpen ? onHide : onMenuClick;
    command(event);
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <SimpleTooltip content={getMessage()}>
        <div>
          <Button
            type="button"
            className="btn-tertiary"
            buttonSize={ButtonSize.Small}
            title="Search history"
            onClick={onMenuOpen}
            icon={<TimerIcon />}
            disabled={options.length === 0 || isLoading}
          />
        </div>
      </SimpleTooltip>
      <ContextMenu
        id={contextMenuId}
        options={options}
        onHidden={() => setIsMenuOpen(false)}
      />
    </>
  );
}
