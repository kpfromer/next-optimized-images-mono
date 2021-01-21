import React from 'react';

const { Svg: Icon, Img: Image } = require('kpfromer-react-optimized-image');

export default () => (
  <div>
    <Icon src={require('./image.svg')} />
    <Image src={require('./image.jpg')} webp />
  </div>
);
