import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import LayoutIcon from '../../icons/layout.svg';
import { getTooltipProps } from '../lib/tooltip';
import { HeaderButton } from './buttons/common';

const FeedSettingsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedSettingsModal" */ './modals/FeedSettingsModal'
    ),
);

export default function FeedSettingsButton(): ReactElement {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <HeaderButton
        icon={<LayoutIcon />}
        {...getTooltipProps('Settings', { position: 'down' })}
        className="btn-tertiary"
        onClick={() => setShowSettings(true)}
        pressed={showSettings}
      />
      {showSettings && (
        <FeedSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
