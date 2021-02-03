/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { ReactElement, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { size1px, size3, size4, size7, sizeN } from '../styles/sizes';
import ArrowIcon from '../icons/arrow.svg';
import { focusOutline } from '../styles/helpers';
import TagsFilter from './TagsFilter';
import { customScrollbars } from './utilities';

const asideWidth = sizeN(89);

const Trigger = styled.button`
  display: flex;
  width: ${sizeN(12)};
  height: ${sizeN(14)};
  align-items: center;
  margin-top: ${sizeN(24)};
  padding: 0 0 0 ${size3};
  background: var(--theme-background-primary);
  border: ${size1px} solid var(--theme-divider-quaternary);
  border-left: none;
  border-radius: 0 ${size4} ${size4} 0;
  color: var(--theme-label-tertiary);
  font-size: ${size7};
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
  border-radius: 0 ${size4} ${size4} 0;
  border-right: ${size1px} solid var(--theme-divider-primary);
  transition: visibility 0s 0.3s;
  visibility: hidden;
`;

const Container = styled.div<{ opened: boolean }>`
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

  ${({ opened }) =>
    opened &&
    `&& {
      transform: translateX(0);
    }

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
  }`}
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
    <Container opened={opened}>
      <Aside css={customScrollbars}>
        <TagsFilter enableQueries={enableQueries} />
      </Aside>
      <Trigger title="Open sidebar" onClick={() => setOpened(!opened)}>
        <ArrowIcon />
      </Trigger>
    </Container>
  );
}
