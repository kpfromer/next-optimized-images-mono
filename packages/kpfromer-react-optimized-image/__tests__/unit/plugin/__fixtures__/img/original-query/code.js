import React from 'react';
import Img from 'kpfromer-react-optimized-image';
import Image from './image.png';

export default () => (
  <div>
    <Img src={Image} original sizes={[400, 800]} />
  </div>
);
