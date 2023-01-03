import dynamic from 'next/dynamic';
import React, { ReactElement, useContext, useState } from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeaturesData } from '../../contexts/FeaturesContext';
import { useSubmitArticle } from '../../hooks/useSubmitArticle';
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
  'canSubmitArticle' | 'submitArticleSidebarButton' | 'submitArticleModalButton'
>;

export function ContributeSection({
  canSubmitArticle,
  submitArticleSidebarButton,
  submitArticleModalButton,
  ...props
}: SectionCommonProps & SubmitFlags): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { isOpen: showSubmitArticle, onIsOpen: setShowSubmitArticle } =
    useSubmitArticle();
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const trackAndShowSubmitArticle = () => {
    trackEvent({
      event_name: 'start submit article',
      feed_item_title: submitArticleSidebarButton,
      extra: JSON.stringify({ has_access: canSubmitArticle }),
    });
    setShowSubmitArticle(true);
  };

  const contributeMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <LinkIcon secondary={active} />} />
      ),
      title: submitArticleSidebarButton,
      action: trackAndShowSubmitArticle,
      active: showSubmitArticle,
    },
    {
      icon: (active) => (
        <ListIcon Icon={() => <EmbedIcon secondary={active} />} />
      ),
      title: 'Suggest new source',
      action: () => setShowNewSourceModal(true),
      active: showNewSourceModal,
    },
  ];

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
