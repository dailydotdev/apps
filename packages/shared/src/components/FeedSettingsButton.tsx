import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import LayoutIcon from './icons/Layout';
import { HeaderButton } from './buttons/common';
import { SimpleTooltip } from './tooltips/SimpleTooltip';

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
      <SimpleTooltip placement="bottom" content="Settings">
        <HeaderButton
          icon={<LayoutIcon />}
          className="btn-tertiary"
          onClick={() => setShowSettings(!showSettings)}
          pressed={showSettings}
        />
      </SimpleTooltip>
      {showSettings && (
        <FeedSettingsModal
          isOpen={showSettings}
          onRequestClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
