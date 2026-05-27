import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { ButtonProps, AllowedTags } from './Button';
import {
  Button,
  ButtonColor,
  ButtonVariant,
  ButtonIconPosition,
} from './Button';
import { ArrowIcon, UpvoteIcon } from '../icons';

const renderComponent = <Tag extends AllowedTags>(
  props: Partial<ButtonProps<Tag>> = {},
): RenderResult => {
  return render(<Button {...(props as ButtonProps<'button'>)} />);
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
      expect(await screen.findByTestId('icon')).toHaveClass('btn-icon-left');
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
      expect(rightIcon).toHaveClass('btn-icon-right');

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

  it('keeps the same label wrapper when toggling loading', () => {
    const { rerender } = render(
      <Button variant={ButtonVariant.Primary}>Button</Button>,
    );

    const initialLabel = screen.getByRole('button').querySelector('.btn-label');

    expect(initialLabel).toBeInTheDocument();
    expect(initialLabel).not.toHaveClass('invisible');

    rerender(
      <Button variant={ButtonVariant.Primary} loading>
        Button
      </Button>,
    );

    const loadingLabel = screen.getByRole('button').querySelector('.btn-label');

    expect(loadingLabel).toBe(initialLabel);
    expect(loadingLabel).toHaveClass('invisible');
  });

  it('does not wrap mixed button content in the label span', () => {
    render(
      <Button variant={ButtonVariant.Primary}>
        Button
        <ArrowIcon data-testid="child-icon" />
      </Button>,
    );

    expect(screen.getByTestId('child-icon')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('.btn-label')).toBeNull();
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

  describe('inactive prop', () => {
    it('sets aria-disabled but stays interactive', async () => {
      const onClick = jest.fn();
      renderComponent({ children: 'Inactive', inactive: true, onClick });
      const button = await screen.findByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).not.toBeDisabled();
      button.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('defers to native disabled when both are set', async () => {
      renderComponent({
        children: 'Disabled',
        inactive: true,
        disabled: true,
      });
      const button = await screen.findByRole('button');
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).toBeDisabled();
    });
  });

  describe('bold prop', () => {
    it('upgrades primary label from semibold to bold', async () => {
      const { rerender } = render(
        <Button variant={ButtonVariant.Primary}>Default</Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('font-semibold');
      expect(screen.getByRole('button')).not.toHaveClass('font-bold');

      rerender(
        <Button variant={ButtonVariant.Primary} bold>
          Bolder
        </Button>,
      );
      expect(screen.getByRole('button')).toHaveClass('font-bold');
      expect(screen.getByRole('button')).not.toHaveClass('font-semibold');
    });

    it('is a no-op on non-primary variants', async () => {
      renderComponent({
        variant: ButtonVariant.Tertiary,
        bold: true,
        children: 'Tertiary bold',
      });
      const button = await screen.findByRole('button');
      expect(button).toHaveClass('font-medium');
      expect(button).not.toHaveClass('font-bold');
    });
  });

  describe('useDefaultCursor prop', () => {
    it('renders default cursor instead of pointer', async () => {
      renderComponent({
        children: 'Default cursor',
        useDefaultCursor: true,
      });
      const button = await screen.findByRole('button');
      expect(button).toHaveClass('cursor-default');
      expect(button).not.toHaveClass('cursor-pointer');
    });

    it('defaults to pointer when omitted', async () => {
      renderComponent({ children: 'Pointer cursor' });
      const button = await screen.findByRole('button');
      expect(button).toHaveClass('cursor-pointer');
      expect(button).not.toHaveClass('cursor-default');
    });
  });
});
