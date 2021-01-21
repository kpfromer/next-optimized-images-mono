import React from 'react';
import Img from 'kpfromer-react-optimized-image';
import Image from './image.png';

export default () => (
  <div>
    <Img src={Image} sizes={[400]} densities={[1, 2]} />
  </div>
);
