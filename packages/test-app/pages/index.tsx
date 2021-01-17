import Img from 'react-optimized-image';
import Image from '../images/test.jpg';

export interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const width = 5472;
  const height = 3648;
  const aspectRatio = width / height;

  const wantedWidth = 750;

  return (
    <>
      {/* <Img /> */}

      <Img
        src={Image}
        placeholder
        width={wantedWidth}
        height={Math.round(wantedWidth / aspectRatio)}
      />
    </>
  );
};

export default Home;
