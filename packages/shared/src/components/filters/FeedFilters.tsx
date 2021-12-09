import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import sizeN from '../../../macros/sizeN.macro';
import FilterMenu from './FilterMenu';
import XIcon from '../../../icons/x.svg';
import { menuItemClassNames } from '../multiLevelMenu/MultiLevelMenuMaster';
import useFeedSettings from '../../hooks/useFeedSettings';
import AlertContext from '../../contexts/AlertContext';

const asideWidth = sizeN(89);

interface FeedFiltersProps {
  isOpen?: boolean;
  onBack?: () => void;
}

export default function FeedFilters({
  isOpen,
  onBack,
}: FeedFiltersProps): ReactElement {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { hasAnyFilter } = useFeedSettings();
  const [hidden, setHidden] = useState(true);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (isOpen) {
      if (alerts?.filter && hasAnyFilter) {
        updateAlerts({ filter: false });
      }

      if (!hidden) {
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHidden(false);
      return;
    }

    if (hidden) {
      return;
    }

    timeoutRef.current = window.setTimeout(() => setHidden(true), 300);
    // eslint-disable-next-line consistent-return
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [isOpen, alerts, hasAnyFilter]);

  return (
    <aside
      className={classNames(
        'fixed top-14 left-0 z-3 bottom-0 self-stretch bg-theme-bg-primary rounded-r-2xl border-t border-r border-theme-divider-primary overflow-y-auto',
        'transition-transform duration-200 ease-linear delay-100',
        isOpen ? 'translate-x-0' : '-translate-x-96 pointer-events-none',
        hidden && 'invisible',
      )}
      style={{ width: asideWidth }}
    >
      <div
        className={classNames(
          menuItemClassNames,
          'border-b border-theme-divider-tertiary',
        )}
      >
        <button onClick={onBack} type="button">
          <XIcon className="text-2xl -rotate-90 text-theme-label-tertiary" />
        </button>
      </div>
      <FilterMenu />
    </aside>
  );
}
