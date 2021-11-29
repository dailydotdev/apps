import React, { ReactElement } from 'react';
import request from 'graphql-request';
import { useInfiniteQuery } from 'react-query';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { UpvoterList } from '../profile/UpvoterList';
import {
  UpvoterListPlaceholder,
  UpvoterListPlaceholderProps,
} from '../profile/UpvoterListPlaceholder';
import { apiUrl } from '../../lib/config';
import { RequestQuery, UpvotesData } from '../../graphql/common';

export interface UpvotedPopupModalProps extends ModalProps {
  listPlaceholderProps: UpvoterListPlaceholderProps;
  requestQuery: RequestQuery<UpvotesData>;
}

export function FeedSettingsModal(): ReactElement {
  return (
    <ResponsiveModal isOpen={false}>
      <header className="py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Upvoted by</h3>
        <ModalCloseButton />
      </header>
      <section className="overflow-auto relative flex-shrink w-full h-full max-h-full">
        Content here
      </section>
    </ResponsiveModal>
  );
}

export default FeedSettingsModal;
