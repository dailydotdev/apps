import styled from 'styled-components';
import LazyImage from './LazyImage';
import { size10 } from '../styles/sizes';

export const RoundedImage = styled(LazyImage)`
  width: ${size10};
  height: ${size10};
  border-radius: 100%;
`;
