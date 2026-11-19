import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuaternaryButton } from './QuaternaryButton';

class TestPointerEvent extends MouseEvent {
  pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}
Object.assign(window, { PointerEvent: TestPointerEvent });

const renderComponent = () =>
  render(
    <QuaternaryButton id="upvote-btn" aria-label="Upvote">
      12
    </QuaternaryButton>,
  );

describe('QuaternaryButton', () => {
  it('should show the button hover while a mouse is over the counter', () => {
    renderComponent();
    const button = screen.getByLabelText('Upvote');
    const label = screen.getByText('12');

    fireEvent.pointerEnter(label, { pointerType: 'mouse' });
    expect(button).toHaveClass('hover');

    fireEvent.pointerLeave(label, { pointerType: 'mouse' });
    expect(button).not.toHaveClass('hover');
  });

  it('should not keep the button hover after a tap on the counter', () => {
    renderComponent();
    const button = screen.getByLabelText('Upvote');
    const label = screen.getByText('12');

    fireEvent.pointerEnter(label, { pointerType: 'touch' });
    fireEvent.mouseOver(label);
    fireEvent.click(label);

    expect(button).not.toHaveClass('hover');
  });
});
