import React, {
  MouseEventHandler,
  ReactElement,
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
import { getSearchUrl, searchPageUrl } from '../../graphql/search';

const contextMenuId = 'search-history-input';

export function SearchHistoryButton(): ReactElement {
  const {
    nodes,
    result: { isLoading },
  } = useSearchHistory({ limit: 3 });
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { onMenuClick, onHide } = useContextMenu({ id: contextMenuId });

  const getMessage = () => {
    if (isLoading) return 'Loading your search queries...';

    return nodes.length === 0
      ? 'Your search history is empty'
      : 'See search history';
  };

  const options = useMemo<MenuItemProps[]>(() => {
    if (!nodes.length) return [];

    const result = nodes.map(({ node }) => ({
      icon: <TimerIcon />,
      label: node.prompt,
      action: () => router.push(getSearchUrl({ id: node.id })),
    }));

    result.push({
      icon: null,
      label: 'Show all',
      action: () => router.push(searchPageUrl),
    });

    return result;
  }, [router, nodes]);

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
            disabled={nodes.length === 0 || isLoading}
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
