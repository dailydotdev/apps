import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './customModal.module.css';
import TagsFilter from '../filters/TagsFilter';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import XIcon from '../icons/Close';
import { Button } from '../buttons/Button';
import { MyFeedIntro } from '../MyFeedIntro';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { OnboardingMode } from '../../graphql/feed';
import { TargetId } from '../../lib/analytics';

interface GetFooterButtonProps {
  hasUser: boolean;
  showIntro: boolean;
  onSkip?: React.MouseEventHandler;
  onContinue: () => void;
  onCreate: () => void;
}
const getFooterButton = ({
  showIntro,
  hasUser,
  onSkip,
  onContinue,
  onCreate,
}: GetFooterButtonProps): ReactElement => {
  if (showIntro) {
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
  }

  if (hasUser) {
    return (
      <Button className="btn-primary-cabbage" onClick={onSkip}>
        Done
      </Button>
    );
  }

  return (
    <CreateFeedFilterButton
      className="w-40 btn-primary-cabbage"
      feedFilterModalType="v4"
      onClick={onCreate}
    />
  );
};

interface LegacyOnboardingModalProps extends ModalProps {
  mode?: OnboardingMode;
  hasUser: boolean;
  onCreate: () => void;
}

export default function LegacyOnboardingModal({
  mode = OnboardingMode.Manual,
  hasUser,
  className,
  onCreate,
  onRequestClose,
  ...modalProps
}: LegacyOnboardingModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  useEffect(() => {
    trackEvent({
      event_name: 'impression',
      target_type: 'my feed modal',
      target_id: TargetId.Legacy,
      extra: JSON.stringify({
        origin: mode,
      }),
    });
  }, []);

  return (
    <ResponsiveModal
      className={classNames(className, styles.customModal)}
      {...modalProps}
      style={{
        content: {
          height: '100%',
        },
      }}
      onRequestClose={onRequestClose}
    >
      {!showIntro && (
        <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 flex-row justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary bg-theme-bg-tertiary">
          <h3 className="font-bold typo-title3">Feed filters</h3>
          <Button
            className="btn-tertiary"
            buttonSize="small"
            title="Close"
            icon={<XIcon />}
            onClick={onRequestClose}
          />
        </header>
      )}
      <section
        className={classNames(
          ' flex-1',
          showIntro && 'flex items-center justify-center',
          !showIntro && 'mt-6',
        )}
      >
        {showIntro ? <MyFeedIntro /> : <TagsFilter />}
      </section>
      <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 left-0 justify-between items-center py-3 px-4 w-full border-t border-theme-divider-tertiary bg-theme-bg-tertiary">
        {getFooterButton({
          showIntro,
          hasUser,
          onCreate,
          onSkip: onRequestClose,
          onContinue: () => setShowIntro(false),
        })}
      </footer>
    </ResponsiveModal>
  );
}
