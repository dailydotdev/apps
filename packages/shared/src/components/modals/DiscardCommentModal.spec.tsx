import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import DiscardCommentModal, { Props } from './DiscardCommentModal';

const onRequestClose = jest.fn();
const onDeleteComment = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (props: Partial<Props> = {}): RenderResult => {
  const defaultProps: Props = {
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
    onDeleteComment,
  };

  return render(<DiscardCommentModal {...defaultProps} {...props} />);
};

it('should confirm comment delete', async () => {
  renderComponent();
  const el = await screen.findByText('Discard');
  el.click();
  expect(onDeleteComment).toBeCalledTimes(1);
});
