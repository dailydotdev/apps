/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { ReactElement, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import sizeN from '../macros/sizeN.macro';
import rem from '../macros/rem.macro';
import ArrowIcon from '../icons/arrow.svg';
import { focusOutline } from '../styles/helpers';
import TagsFilter from './TagsFilter';
import classNames from 'classnames';
import { getTooltipProps } from '../lib/tooltip';

const asideWidth = sizeN(89);

const Trigger = styled.button`
  display: flex;
  width: ${sizeN(12)};
  height: ${sizeN(14)};
  align-items: center;
  margin-top: ${sizeN(24)};
  padding: 0 0 0 ${sizeN(3)};
  background: var(--theme-background-primary);
  border: ${rem(1)} solid var(--theme-divider-quaternary);
  border-left: none;
  border-radius: 0 ${sizeN(4)} ${sizeN(4)} 0;
  color: var(--theme-label-tertiary);
  font-size: ${sizeN(7)};
  cursor: pointer;
  ${focusOutline}

  &:hover {
    color: var(--theme-label-primary);
  }

  .icon {
    transform: rotate(90deg);
    transition: transform 0.2s linear 0.1s;
  }
`;

const Aside = styled.aside`
  width: ${asideWidth};
  overflow-y: scroll;
  align-self: stretch;
  background: var(--theme-background-primary);
  border-radius: 0 ${sizeN(4)} ${sizeN(4)} 0;
  border-right: ${rem(1)} solid var(--theme-divider-primary);
  transition: visibility 0s 0.3s;
  visibility: hidden;
`;

const Container = styled.div`
  display: flex;
  position: fixed;
  align-items: flex-start;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 3;
  transform: translateX(-${asideWidth});
  will-change: transform;
  transition: transform 0.2s linear 0.1s;
  pointer-events: none;

  > * {
    pointer-events: all;
  }

  &.opened {
    transform: translateX(0);

    ${Trigger} {
      color: var(--theme-label-primary);
      border-color: var(--theme-divider-primary);

      .icon {
        transform: rotate(270deg);
      }
    }

    ${Aside} {
      visibility: visible;
      transition-delay: 0s;
    }
  }
`;

export default function Sidebar(): ReactElement {
  const [opened, setOpened] = useState(false);
  const [enableQueries, setEnableQueries] = useState(false);

  useEffect(() => {
    if (opened && !enableQueries) {
      setTimeout(() => {
        setEnableQueries(true);
      }, 300);
    }
  }, [opened]);

  return (
    <Container className={classNames({ opened })}>
      <Aside className="scrollbar">
        <TagsFilter enableQueries={enableQueries} />
      </Aside>
      <Trigger
        {...getTooltipProps('Open sidebar', { position: 'right' })}
        onClick={() => setOpened(!opened)}
      >
        <ArrowIcon />
      </Trigger>
    </Container>
  );
}
