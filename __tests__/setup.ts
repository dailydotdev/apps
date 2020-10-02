import '@testing-library/jest-dom';
import 'jest-styled-components';
import ReactGA from 'react-ga';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
ReactGA.initialize('foo', { testMode: true });
