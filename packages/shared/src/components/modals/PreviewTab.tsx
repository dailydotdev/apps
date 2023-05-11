import React, { ReactElement, ReactNode, useContext } from 'react';
import MarkdownPreview, {
  MarkdownPreviewProps,
} from '../fields/MarkdownPreview';
import { ModalPropsContext } from './common/types';
import { Modal } from './common/Modal';

interface PreviewTabProps extends Omit<MarkdownPreviewProps, 'enabled'> {
  tabName: string;
  children: ReactNode;
}

const PreviewTab = ({
  tabName,
  children,
  ...props
}: PreviewTabProps): ReactElement => {
  const { activeView } = useContext(ModalPropsContext);
  console.log(activeView, tabName);

  return (
    <>
      <Modal.Body view={tabName}>
        <MarkdownPreview {...props} enabled={activeView === tabName} />
      </Modal.Body>
      <Modal.Footer view={tabName}>{children}</Modal.Footer>
    </>
  );
};

export default PreviewTab;
