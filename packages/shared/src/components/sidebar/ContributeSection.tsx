import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import EmbedIcon from '../icons/Embed';
import LinkIcon from '../icons/Link';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useAuthContext } from '../../contexts/AuthContext';

export function ContributeSection(props: SectionCommonProps): ReactElement {
  const router = useRouter();
  const { user } = useAuthContext();
  const { modal, openModal } = useLazyModal();
  const { trackEvent } = useAnalyticsContext();

  const trackAndShowSubmitArticle = () => {
    trackEvent({
      event_name: 'start submit article',
      feed_item_title: 'Submit article',
      extra: JSON.stringify({ has_access: !!user?.canSubmitArticle }),
    });
    openModal({ type: LazyModal.SubmitArticle });
  };

  const contributeMenuItems: SidebarMenuItem[] = [
    {
      icon: (active: boolean) => (
        <ListIcon Icon={() => <LinkIcon secondary={active} />} />
      ),
      title: 'Submit article',
      action: trackAndShowSubmitArticle,
      active: modal.type === LazyModal.SubmitArticle,
    },
    {
      icon: (active) => (
        <ListIcon Icon={() => <EmbedIcon secondary={active} />} />
      ),
      title: 'Suggest new source',
      action: () => openModal({ type: LazyModal.NewSource }),
      active: modal.type === LazyModal.NewSource,
    },
  ];

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(search);
    if (!query?.scout) {
      return;
    }

    const { origin, pathname } = window.location;
    trackAndShowSubmitArticle();
    router.replace(origin + pathname);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section
      title="Contribute"
      items={contributeMenuItems}
      {...props}
      isItemsButton={false}
    />
  );
}
