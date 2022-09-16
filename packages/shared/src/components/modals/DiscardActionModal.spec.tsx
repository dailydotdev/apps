import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import DiscardActionModal, {
  DiscardActionModalProps,
} from './DiscardActionModal';

const onRequestClose = jest.fn();
const rightButtonAction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (
  props: Partial<DiscardActionModalProps> = {},
): RenderResult => {
  const defaultProps: DiscardActionModalProps = {
    isOpen: true,
    ariaHideApp: false,
    onRequestClose,
    rightButtonAction,
  };

  return render(<DiscardActionModal {...defaultProps} {...props} />);
};

it('should confirm comment delete', async () => {
  renderComponent();
  const el = await screen.findByText('Discard');
  el.click();
  expect(rightButtonAction).toBeCalledTimes(1);
});
