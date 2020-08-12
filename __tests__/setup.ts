import '@testing-library/jest-dom';
import 'jest-styled-components';
import ReactGA from 'react-ga';

ReactGA.initialize('foo', { testMode: true });
