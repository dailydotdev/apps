import React from 'react';
import type { ReactElement } from 'react';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

function RecruiterPage(): ReactElement {
  return <p className="p-4">Recruiter self serve</p>;
}

RecruiterPage.getLayout = getLayout;

export default RecruiterPage;
