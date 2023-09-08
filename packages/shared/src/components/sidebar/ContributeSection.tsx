import dynamic from 'next/dynamic';
import React, { ReactElement, useState } from 'react';
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

export function ContributeSection(props: SectionCommonProps): ReactElement {
  const { isOpen: showSubmitArticle, onIsOpen: setShowSubmitArticle } =
    useSubmitArticle();
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);

  const contributeMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <LinkIcon secondary={active} />} />
      ),
      title: 'Submit article',
      action: () => setShowSubmitArticle(true),
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
          headerCopy="Submit article"
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
