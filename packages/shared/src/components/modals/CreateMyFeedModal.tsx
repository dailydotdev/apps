import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './AccountDetailsModal.module.css';
import TagsFilter from '../filters/TagsFilter';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';
import { MyFeedIntro } from '../MyFeedIntro';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { MyFeedMode } from '../../graphql/feed';

interface GetFooterButtonProps {
  showIntro: boolean;
  version: string;
  onSkip?: React.MouseEventHandler;
  onContinue: () => void;
}
const getFooterButton = ({
  showIntro,
  version,
  onSkip,
  onContinue,
}: GetFooterButtonProps): ReactElement => {
  if (!showIntro) {
    return (
      <CreateFeedFilterButton
        className="w-40 btn-primary-cabbage"
        feedFilterModalType="v4"
      />
    );
  }

  if (version === 'v2') {
    return (
      <Button className="btn-primary-cabbage" onClick={onContinue}>
        Create my feed
      </Button>
    );
  }

  return (
    <>
      <Button className="btn-tertiary" onClick={onSkip}>
        Skip
      </Button>
      <Button className="btn-primary-cabbage" onClick={onContinue}>
        Continue
      </Button>
    </>
  );
};

const introVariants = ['v2', 'v3'];
const closableVariants = ['control', 'v3'];

interface CreateMyFeedModalProps extends ModalProps {
  version?: string;
  mode?: string;
}
export default function CreateMyFeedModal({
  mode = MyFeedMode.Manual,
  version = 'control',
  className,
  onRequestClose,
  ...modalProps
}: CreateMyFeedModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [showIntro, setShowIntro] = useState<boolean>(
    introVariants.includes(version),
  );

  useEffect(() => {
    trackEvent({
      event_name: 'impression',
      target_type: 'my feed modal',
      target_id: version,
      extra: JSON.stringify({
        origin: mode,
      }),
    });
  }, []);

  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...modalProps}
      style={{
        content: {
          height: '180rem',
        },
      }}
      onRequestClose={closableVariants.includes(version) && onRequestClose}
    >
      {!showIntro && (
        <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 flex-row justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-tertiary">
          <h3 className="font-bold typo-title3">Feed filters</h3>
          {closableVariants.includes(version) && (
            <Button
              className="btn-tertiary"
              buttonSize="small"
              title="Close"
              icon={<XIcon />}
              onClick={onRequestClose}
            />
          )}
        </header>
      )}
      <section className={classNames('flex-1', !showIntro && 'mt-6')}>
        {showIntro ? <MyFeedIntro /> : <TagsFilter />}
      </section>
      <footer
        className={classNames(
          'flex fixed responsiveModalBreakpoint:sticky bottom-0 items-center border-t border-theme-divider-tertiary bg-theme-bg-tertiary py-3',
          version === 'v3' ? 'justify-between px-4' : 'justify-center',
        )}
      >
        {getFooterButton({
          showIntro,
          version,
          onSkip: onRequestClose,
          onContinue: () => setShowIntro(false),
        })}
      </footer>
    </ResponsiveModal>
  );
}
