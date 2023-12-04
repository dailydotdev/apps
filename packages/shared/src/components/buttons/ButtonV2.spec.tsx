import { render, RenderResult, screen } from '@testing-library/react';
import React, { HTMLAttributes } from 'react';
import {
  Button,
  BaseButtonProps,
  ButtonColor,
  ButtonKind,
  ButtonVariant,
} from './ButtonV2';
import UpvoteIcon from '../icons/Upvote';

const renderComponent = <
  C extends HTMLElement = HTMLButtonElement,
  P = HTMLAttributes<C>,
>(
  props: Partial<BaseButtonProps & P> = {},
): RenderResult => {
  return render(<Button {...props} />);
};

it('should render children', async () => {
  renderComponent({ children: 'Button' });
  expect(await screen.findByText('Button')).toBeInTheDocument();
});

it('should render primary button', async () => {
  renderComponent({ variant: ButtonVariant.Primary, children: 'Primary' });
  expect(await screen.findByRole('button')).toBeInTheDocument();
  expect(await screen.findByRole('button')).toHaveClass('btn-primary');
});

it('should render secondary button with color', async () => {
  renderComponent({
    variant: ButtonVariant.Secondary,
    color: ButtonColor.Burger,
    children: 'Secondary burger',
  });
  expect(await screen.findByRole('button')).toBeInTheDocument();
  expect(await screen.findByRole('button')).toHaveClass('btn-secondary-burger');
});

it('color prop can be overriden with className', async () => {
  renderComponent({
    variant: ButtonVariant.Secondary,
    color: ButtonColor.Burger,
    children: 'Secondary burger',
    className: 'btn-secondary-bacon',
  });

  const button = await screen.findByRole('button');
  expect(button).toBeInTheDocument();

  expect(button).toHaveClass('btn-secondary-burger');
  expect(button).toHaveClass('btn-secondary-bacon');

  expect(button.className.indexOf('btn-secondary-burger')).toBeLessThan(
    button.className.indexOf('btn-secondary-bacon'),
  );
});

it('providing color without variant does not do anything', async () => {
  renderComponent({ color: ButtonColor.Burger, children: 'Button' });
  expect(await screen.findByRole('button')).toBeInTheDocument();
  // We need to specifically verify that className does not contain the burger substring
  // eslint-disable-next-line jest-dom/prefer-to-have-class
  expect((await screen.findByRole('button')).className).not.toContain('burger');
});

it('should render icon', async () => {
  renderComponent({ icon: <UpvoteIcon data-testid="icon" /> });
  expect(await screen.findByTestId('icon')).toBeInTheDocument();
});

it('should render right icon', async () => {
  renderComponent({ rightIcon: <UpvoteIcon data-testid="right-icon" /> });
  expect(await screen.findByTestId('right-icon')).toBeInTheDocument();
});

it('should render loader and set aria-busy when loading', async () => {
  renderComponent({ children: 'Button', loading: true });
  expect(await screen.findByRole('button')).toHaveAttribute(
    'aria-busy',
    'true',
  );
  expect(await screen.findByTestId('buttonLoader')).toBeInTheDocument();
});

it('should set aria-pressed when pressed is true', async () => {
  renderComponent({ children: 'Button', pressed: true });
  expect(await screen.findByRole('button')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

it('should render the button as an anchor element', async () => {
  renderComponent({
    children: 'Button',
    kind: ButtonKind.Link,
    href: 'https://daily.dev',
  });
  expect(await screen.findByRole('link')).toBeInTheDocument();
});
