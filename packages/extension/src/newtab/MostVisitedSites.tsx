import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import useTopSites from './useTopSites';
import MostVisitedSitesModal from './MostVisitedSitesModal';

export default function MostVisitedSites(): ReactElement {
  const { topSites, askTopSitesPermission } = useTopSites();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {topSites ? (
        <>
          {topSites.map((topSite, index) => (
            <a
              href={topSite.url}
              rel="noopener noreferrer"
              className={classNames(
                'focus-outline w-8 h-8 rounded-lg overflow-hidden bg-white',
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
