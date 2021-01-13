import { render, RenderResult, screen } from '@testing-library/preact';
import React, { HTMLAttributes } from 'react';
import BaseButton, {
  BaseButtonProps,
} from '../../components/buttons/BaseButton';
import { primaryStyle } from '../../components/buttons/PrimaryButton';
import UpvoteIcon from '../../icons/upvote.svg';

const renderComponent = <
  C extends HTMLElement = HTMLButtonElement,
  P = HTMLAttributes<C>
>(
  props: Partial<BaseButtonProps & P> = {},
): RenderResult => {
  return render(<BaseButton {...primaryStyle()} {...props} />);
};

it('should render children', async () => {
  renderComponent({ children: 'Button' });
  expect(await screen.findByText('Button')).toBeInTheDocument();
});

it('should render icon', async () => {
  renderComponent({ icon: <UpvoteIcon data-testid="icon" /> });
  expect(await screen.findByTestId('icon')).toBeInTheDocument();
});

it('should render right icon', async () => {
  renderComponent({ rightIcon: <UpvoteIcon data-testid="icon" /> });
  expect(await screen.findByTestId('icon')).toBeInTheDocument();
});

it('should render loader and set aria-busy when loading', async () => {
  renderComponent({ children: 'Button', loading: true });
  expect(await screen.findByText('Button')).toHaveStyle({
    visibility: 'hidden',
  });
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
  renderComponent({ children: 'Button', tag: 'a', href: 'https://daily.dev' });
  expect(await screen.findByRole('link')).toBeInTheDocument();
});
