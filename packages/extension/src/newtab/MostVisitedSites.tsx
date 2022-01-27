import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import useTopSites from './useTopSites';
import MostVisitedSitesModal from './MostVisitedSitesModal';

export default function MostVisitedSites(): ReactElement {
  const { showTopSites } = useContext(SettingsContext);
  const { topSites, askTopSitesPermission } = useTopSites();
  const [showModal, setShowModal] = useState(false);

  if (!showTopSites) {
    return <></>;
  }

  return (
    <>
      {topSites ? (
        <>
          {topSites.map((topSite, index) => (
            <a
              href={topSite.url}
              rel="noopener noreferrer"
              className={classNames(
                'focus-outline w-8 h-8 rounded-lg overflow-hidden bg-[#0E1217] border-[#2D323B]',
                index > 0 && 'ml-2',
                index >= 4 && 'hidden laptopL:block',
              )}
              key={topSite.url}
              title={topSite.title}
            >
              <img
                src={`https://api.daily.dev/icon?url=${encodeURIComponent(
                  topSite.url,
                )}&size=32`}
                alt={topSite.title}
                className="w-full h-full"
              />
            </a>
          ))}
        </>
      ) : (
        <QuaternaryButton
          id="mvs-button"
          icon={<PlusIcon />}
          className="btn-tertiary"
          reverse
          onClick={() => setShowModal(true)}
        >
          Show most visited sites
        </QuaternaryButton>
      )}
      {showModal && (
        <MostVisitedSitesModal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          onApprove={() => {
            setShowModal(false);
            return askTopSitesPermission();
          }}
        />
      )}
    </>
  );
}
