import dynamic from 'next/dynamic';
import React, { ReactElement, useContext, useState } from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeaturesData } from '../../contexts/FeaturesContext';
import EmbedIcon from '../icons/Embed';
import LinkIcon from '../icons/Link';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';

const SubmitArticleModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "submitArticleModal" */ '../modals/SubmitArticleModal'
    ),
);

const NewSourceModal = dynamic(
  () =>
    import(/* webpackChunkName: "newSourceModal" */ '../modals/NewSourceModal'),
);

type SubmitFlags = Pick<
  FeaturesData,
  | 'canSubmitArticle'
  | 'submitArticleOn'
  | 'submitArticleSidebarButton'
  | 'submitArticleModalButton'
>;

export function ContributeSection({
  canSubmitArticle,
  submitArticleOn,
  submitArticleSidebarButton,
  submitArticleModalButton,
  ...props
}: SectionCommonProps & SubmitFlags): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [showSubmitArticle, setShowSubmitArticle] = useState(false);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const contributeMenuItems: SidebarMenuItem[] = [
    {
      icon: () => <ListIcon Icon={() => <EmbedIcon />} />,
      title: 'Suggest new source',
      action: () => setShowNewSourceModal(true),
      active: showNewSourceModal,
    },
  ];

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
    contributeMenuItems.unshift(submitArticleMenuItem);
  }

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
