import { render, RenderResult, screen } from '@testing-library/react';
import React from 'react';
import {
  Button,
  ButtonProps,
  ButtonColor,
  ButtonVariant,
  ButtonIconPosition,
  AllowedTags,
} from './Button';
import { UpvoteIcon } from '../icons';

const renderComponent = <Tag extends AllowedTags>(
  props: Partial<ButtonProps<Tag>> = {},
): RenderResult => {
  return render(<Button {...props} />);
};

describe('Button', () => {
  it('should render children', async () => {
    renderComponent({ children: 'Button' });
    expect(await screen.findByText('Button')).toBeInTheDocument();
  });

  describe('variants', () => {
    it('should render primary button', async () => {
      renderComponent({ variant: ButtonVariant.Primary, children: 'Primary' });
      expect(await screen.findByRole('button')).toBeInTheDocument();
      expect(await screen.findByRole('button')).toHaveClass('btn-primary');
    });

    it('should render tertiary button', async () => {
      renderComponent({
        variant: ButtonVariant.Tertiary,
        children: 'Tertiary',
      });
      expect(await screen.findByRole('button')).toBeInTheDocument();
      expect(await screen.findByRole('button')).toHaveClass('btn-tertiary');
    });
  });

  describe('colors', () => {
    it('should render secondary button with color', async () => {
      renderComponent({
        variant: ButtonVariant.Secondary,
        color: ButtonColor.Burger,
        children: 'Secondary burger',
      });
      expect(await screen.findByRole('button')).toBeInTheDocument();
      expect(await screen.findByRole('button')).toHaveClass(
        'btn-secondary-burger',
      );
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
  });

  describe('icons', () => {
    it('should render icon button', async () => {
      renderComponent({
        icon: <UpvoteIcon data-testid="icon" />,
        children: 'Upvote',
      });
      expect(await screen.findByTestId('icon')).toBeInTheDocument();
      expect(await screen.findByRole('button')).not.toHaveClass('iconOnly');
    });

    it('should render right icon', async () => {
      renderComponent({
        icon: <UpvoteIcon data-testid="right-icon" />,
        iconPosition: ButtonIconPosition.Right,
        children: 'Upvote',
      });

      const button = await screen.findByRole('button');
      const rightIcon = await screen.findByTestId('right-icon');

      expect(button).toBeInTheDocument();
      expect(rightIcon).toBeInTheDocument();

      // check if icon appears AFTER the label
      expect(button.innerHTML.indexOf('Upvote')).toBeLessThan(
        button.innerHTML.indexOf(rightIcon.outerHTML),
      );
    });

    it('should render iconOnly button', async () => {
      renderComponent({
        icon: <UpvoteIcon data-testid="icon" />,
      });
      expect(await screen.findByTestId('icon')).toBeInTheDocument();
      expect(await screen.findByRole('button')).toHaveClass('iconOnly');
    });
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
      tag: 'a',
      href: 'https://daily.dev',
    });
    expect(await screen.findByRole('link')).toBeInTheDocument();
  });
});
