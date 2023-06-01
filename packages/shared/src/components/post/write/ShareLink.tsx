import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Squad } from '../../../graphql/sources';
import MarkdownInput from '../../fields/MarkdownInput';
import { WriteFooter } from './WriteFooter';
import { SourceAvatar, SourceShortInfo } from '../../profile/source';
import SquadIcon from '../../icons/Squad';
import { ButtonSize } from '../../buttons/Button';
import { Dropdown } from '../../fields/Dropdown';
import { useAuthContext } from '../../../contexts/AuthContext';
import { SubmitExternalLink } from './SubmitExternalLink';

interface ShareLinkProps {
  squad: Squad;
  className?: string;
}

export function ShareLink({ className }: ShareLinkProps): ReactElement {
  const { squads } = useAuthContext();
  const squadsList = squads?.map(({ name }) => name) ?? [];
  const [selected, setSelected] = useState(-1);

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
  };

  const renderDropdownItem = (value: string, index: number) => {
    const source = squads[index];

    return <SourceShortInfo source={source} className="pl-1" />;
  };

  return (
    <form
      className={classNames('flex flex-col gap-4', className)}
      onSubmit={onSubmit}
    >
      <Dropdown
        icon={
          selected !== -1 ? (
            <SourceAvatar source={squads[selected]} size="small" />
          ) : (
            <SquadIcon className="mr-2" />
          )
        }
        placeholder="Select squad"
        buttonSize={ButtonSize.Large}
        className={{
          container: 'mt-6 w-70',
          menu: 'menu-secondary',
          item: 'h-auto',
        }}
        selectedIndex={selected}
        onChange={(_, index) => setSelected(index)}
        options={squadsList}
        scrollable
        data-testid="timezone_dropdown"
        renderItem={renderDropdownItem}
      />
      <SubmitExternalLink />
      <MarkdownInput
        enabledCommand={{ mention: true }}
        showMarkdownGuide={false}
      />
      <WriteFooter />
    </form>
  );
}
