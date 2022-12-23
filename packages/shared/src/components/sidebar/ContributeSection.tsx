import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
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
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const [showSubmitArticle, setShowSubmitArticle] = useState(false);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const contributeMenuItems: SidebarMenuItem[] = [
    {
      icon: (active) => (
        <ListIcon Icon={() => <EmbedIcon secondary={active} />} />
      ),
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

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);
    if (!query?.scout) {
      return;
    }

    const { origin, pathname } = window.location;
    setShowSubmitArticle(true);
    router.replace(origin + pathname);
  }, []);

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
