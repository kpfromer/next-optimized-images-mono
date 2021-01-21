import React from 'react';
import Img from 'kpfromer-react-optimized-image';
import Image from './image.png';
export default () => (
  <div>
    <Img
      src={Image}
      placeholder="trace"
      rawSrc={{
        fallback: {
          original: {
            1: require('./image.png'),
          },
        },
        placeholder: require('./image.png?width=20&trace'),
      }}
    />
  </div>
);
