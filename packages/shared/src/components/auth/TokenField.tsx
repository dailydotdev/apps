import React, { ReactElement } from 'react';

interface TokenInputProps {
  token: string;
}

function TokenInput({ token }: TokenInputProps): ReactElement {
  return (
    <input
      type="text"
      value={token ?? ''}
      hidden
      id="csrf_token"
      name="csrf_token"
      data-testid="csrf_token"
      readOnly
    />
  );
}

export default TokenInput;
