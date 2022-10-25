import dynamic from 'next/dynamic';
import React, { ReactElement, useContext, useState } from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import FeaturesContext from '../../contexts/FeaturesContext';
import EmbedIcon from '../icons/Embed';
import LinkIcon from '../icons/Link';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';

const SubmitArticleModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "SubmitArticleModal" */ '../modals/SubmitArticleModal'
    ),
);

const NewSourceModal = dynamic(
  () =>
    import(/* webpackChunkName: "NewSourceModal" */ '../modals/NewSourceModal'),
);

export function ContributeSection(props: SectionCommonProps): ReactElement {
  const {
    canSubmitArticle,
    submitArticleOn,
    submitArticleSidebarButton,
    submitArticleModalButton,
  } = useContext(FeaturesContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const [showSubmitArticle, setShowSubmitArticle] = useState(false);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const contributeMenuItems: SidebarMenuItem[] = [];

  const trackAndShowSubmitArticle = () => {
    trackEvent({
      event_name: 'start submit article',
      feed_item_title: submitArticleSidebarButton,
      extra: JSON.stringify({ has_access: canSubmitArticle }),
    });
    setShowSubmitArticle(true);
  };

  if (submitArticleOn) {
    const submitArticleMenuItem = {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <LinkIcon secondary={active} />} />
      ),
      title: submitArticleSidebarButton,
      action: trackAndShowSubmitArticle,
      active: showSubmitArticle,
    };
    contributeMenuItems.push(submitArticleMenuItem);
  }

  contributeMenuItems.push({
    icon: () => <ListIcon Icon={() => <EmbedIcon />} />,
    title: 'Suggest new source',
    action: () => setShowNewSourceModal(true),
    active: showNewSourceModal,
  });

  return (
    <>
      <Section
        title="Contribute"
        items={contributeMenuItems}
        {...props}
        isItemsButton={false}
      />
      {showSubmitArticle && (
        <SubmitArticleModal
          headerCopy={submitArticleSidebarButton}
          submitArticleModalButton={submitArticleModalButton}
          isOpen={showSubmitArticle}
          onRequestClose={() => setShowSubmitArticle(false)}
        />
      )}
      {showNewSourceModal && (
        <NewSourceModal
          isOpen={showNewSourceModal}
          onRequestClose={() => setShowNewSourceModal(false)}
        />
      )}
    </>
  );
}
