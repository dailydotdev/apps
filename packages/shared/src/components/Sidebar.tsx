import React, { ReactElement, useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import sizeN from '../../macros/sizeN.macro';
import SettingsIcon from '../../icons/settings.svg';
import { getTooltipProps } from '../lib/tooltip';
import FeedFilters from './filters/FeedFilters';
import OnboardingContext from '../contexts/OnboardingContext';
import { useRedDot } from '../hooks/useRedDot';

const asideWidth = sizeN(89);
const SIDEBAR_RED_DOT_STATE = 'sidebar_red_dot';
const RedDot = dynamic(
  () => import(/* webpackChunkName: "redDot" */ './RedDot'),
);

export default function Sidebar(): ReactElement {
  const [opened, setOpened] = useState(false);
  const [enableQueries, setEnableQueries] = useState(false);
  const { onboardingStep, incrementOnboardingStep } =
    useContext(OnboardingContext);
  const hightlightTrigger = onboardingStep === 2;
  const [showRedDot, hideRedDot] = useRedDot(SIDEBAR_RED_DOT_STATE);

  useEffect(() => {
    if (opened && !enableQueries) {
      setTimeout(() => {
        setEnableQueries(true);
      }, 300);
    }
  }, [opened]);

  const toggleSidebar = () => {
    if (opened) {
      setOpened(false);
    } else {
      setOpened(true);
      if (showRedDot) {
        hideRedDot();
      }
      if (hightlightTrigger) {
        incrementOnboardingStep();
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
          'overflow-y-scroll self-stretch bg-theme-bg-primary rounded-r-2xl border-r border-theme-divider-primary',
          !opened && 'invisible',
        )}
        style={{
          width: asideWidth,
          transition: 'visibility 0s',
          pointerEvents: 'all',
          transitionDelay: opened ? '0s' : '0.3s',
        }}
      >
        <FeedFilters enableQueries={enableQueries} />
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
        <div className="relative">
          <SettingsIcon />
          {showRedDot && <RedDot />}
        </div>
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
    </div>
  );
}
