import React, { ReactElement } from 'react';
import styled from 'styled-components';
import TextField from '../components/TextField';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 4rem;

  & > * {
    margin: 1rem;
  }
`;

const Page = (): ReactElement => {
  return (
    <Container>
      <TextField
        inputId="field"
        name="field"
        label="Label"
        placeholder="Placeholder"
        maxLength={100}
        hint="Hint"
        compact
        required
      />
    </Container>
  );
};

export default Page;
