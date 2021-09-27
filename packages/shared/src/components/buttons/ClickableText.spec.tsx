import { render, RenderResult, screen } from '@testing-library/react';
import React, { HTMLAttributes } from 'react';
import { ClickableText, BaseClickableTextProps } from './ClickableText';

const renderComponent = <
  C extends HTMLElement = HTMLButtonElement,
  P = HTMLAttributes<C>,
>({
  title,
  ...props
}: Partial<BaseClickableTextProps & P>): RenderResult => {
  return render(<ClickableText {...props} title={title} />);
};

const dummyTitle = 'Clickable Text';

it('should render title', async () => {
  renderComponent({ title: dummyTitle });
  expect(await screen.findByText(dummyTitle)).toBeInTheDocument();
});

it('should set aria-pressed when pressed is true', async () => {
  renderComponent({ title: dummyTitle, pressed: true });
  expect(await screen.findByRole('button')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

it('should render the clickable text as an anchor element', async () => {
  renderComponent({ title: dummyTitle, tag: 'a', href: 'https://daily.dev' });
  expect(await screen.findByRole('link')).toBeInTheDocument();
});
