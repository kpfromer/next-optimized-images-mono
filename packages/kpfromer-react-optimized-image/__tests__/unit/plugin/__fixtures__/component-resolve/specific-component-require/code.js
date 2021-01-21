import React from 'react';

const { default: Icon } = require('kpfromer-react-optimized-image/lib/components/Svg');
const { default: Image } = require('kpfromer-react-optimized-image/lib/components/Img');

export default () => (
  <div>
    <Icon src={require('./image.svg')} />
    <Image src={require('./image.jpg')} webp />
  </div>
);
