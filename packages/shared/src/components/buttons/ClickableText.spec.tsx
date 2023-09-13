import { render, RenderResult, screen } from '@testing-library/react';
import React, { HTMLAttributes, ReactNode } from 'react';
import { ClickableText, BaseClickableTextProps } from './ClickableText';

const renderComponent = <
  C extends HTMLElement = HTMLButtonElement,
  P = HTMLAttributes<C>,
>({
  children,
  ...props
}: Partial<
  BaseClickableTextProps & P & { children: ReactNode }
>): RenderResult => {
  return render(<ClickableText {...props}>{children}</ClickableText>);
};

const dummyTitle = 'Clickable Text';

it('should render title', async () => {
  renderComponent({ children: dummyTitle });
  expect(await screen.findByText(dummyTitle)).toBeInTheDocument();
});

it('should set aria-pressed when pressed is true', async () => {
  renderComponent({ children: dummyTitle, pressed: true });
  expect(await screen.findByRole('button')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

it('should render the clickable text as an anchor element', async () => {
  renderComponent({
    children: dummyTitle,
    tag: 'a',
    href: 'https://daily.dev',
  });
  expect(await screen.findByRole('link')).toBeInTheDocument();
});
