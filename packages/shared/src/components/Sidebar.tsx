import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import { Source } from '@dailydotdev/shared/src/graphql/sources';
import sizeN from '../../macros/sizeN.macro';
import { getTooltipProps } from '../lib/tooltip';
import OnboardingContext from '../contexts/OnboardingContext';
import FilterMenu from './filters/FilterMenu';
import FilterRedDot from './filters/FilterRedDot';
import useFeedSettings from '../hooks/useFeedSettings';
import AlertContext from '../contexts/AlertContext';
import { Tag } from '../graphql/feedSettings';
import UnblockModal from './modals/UnblockModal';
import { UnblockModalType } from './filters/common';

const asideWidth = sizeN(89);

export default function Sidebar(): ReactElement {
  const { alerts, disableFilterAlert } = useContext(AlertContext);
  const { feedSettings } = useFeedSettings();
  const [opened, setOpened] = useState(false);
  const { onboardingStep, incrementOnboardingStep } =
    useContext(OnboardingContext);
  const hightlightTrigger = onboardingStep === 2;
  const [unblockItem, setUnblockItem] = useState<{
    tag?: Tag;
    source?: Source;
    action?: () => unknown;
  }>();

  const initUnblockModal = ({
    tag = null,
    source = null,
    action,
  }: UnblockModalType) => {
    setUnblockItem({ tag, source, action });
  };

  const toggleSidebar = () => {
    if (opened) {
      setOpened(false);
    } else {
      setOpened(true);
      if (hightlightTrigger) {
        incrementOnboardingStep();
      }
      if (
        alerts?.filter &&
        (feedSettings?.includeTags?.length ||
          feedSettings?.blockedTags?.length ||
          feedSettings?.excludeSources?.length ||
          feedSettings?.advancedSettings?.length)
      ) {
        disableFilterAlert();
      }
    }
  };

  return (
    <div
      className={classNames(
        'fixed flex items-start top-0 left-0 h-full z-3 pointer-events-none',
        { opened },
      )}
      style={{
        transform: opened ? 'translateX(0)' : `translateX(-${asideWidth})`,
        willChange: 'transform',
        transition: 'transform 0.2s linear 0.1s',
      }}
    >
      <aside
        className={classNames(
          'self-stretch bg-theme-bg-primary rounded-r-2xl border-r border-theme-divider-primary overflow-y-auto',
          !opened && 'invisible',
        )}
        style={{
          width: asideWidth,
          transition: 'visibility 0s',
          pointerEvents: 'all',
          transitionDelay: opened ? '0s' : '0.3s',
        }}
      >
        <FilterMenu initUnblockModal={initUnblockModal} />
      </aside>
      <button
        type="button"
        className={classNames(
          'flex w-12 h-14 items-center pl-3 border-l-0 rounded-r-2xl cursor-pointer focus-outline',
          hightlightTrigger
            ? 'bg-theme-label-primary text-theme-bg-primary'
            : 'bg-theme-bg-primary border hover:text-theme-label-primary',
          !hightlightTrigger &&
            (opened
              ? 'text-theme-label-primary border-theme-divider-primary'
              : 'text-theme-label-tertiary border-theme-divider-quaternary'),
        )}
        style={{
          fontSize: '1.75rem',
          pointerEvents: 'all',
          marginTop: '6.375rem',
        }}
        {...getTooltipProps('Open sidebar', { position: 'right' })}
        onClick={toggleSidebar}
      >
        <FilterRedDot />
        {hightlightTrigger && (
          <div
            className="absolute left-0 -z-1 w-14 bg-theme-hover rounded-r-3xl"
            style={{
              top: '-1rem',
              height: '5.5rem',
              animation: 'rank-attention 2s infinite ease-in-out',
            }}
          />
        )}
      </button>
      {unblockItem && (
        <UnblockModal
          item={unblockItem}
          isOpen={!!unblockItem}
          onConfirm={unblockItem.action}
          onRequestClose={() => setUnblockItem(null)}
        />
      )}
    </div>
  );
}
