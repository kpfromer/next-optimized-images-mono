import Img from 'kpfromer-react-optimized-image';
import Image from '../images/test.jpg';
import ImageTwo from '../images/test-2.jpg';
import ImageThree from '../images/test-3.jpg';

export interface HomeProps {}

const FirstImg = () => {
  const width = 5472;
  const height = 3648;
  const aspectRatio = width / height;

  const wantedWidth = 750;

  return (
    <Img
      src={Image}
      placeholder="trace"
      width={wantedWidth}
      height={Math.round(wantedWidth / aspectRatio)}
    />
  );
};

const SecondImg = () => {
  const width = 3667;
  const height = 5500;
  const aspectRatio = width / height;

  const wantedWidth = 500;

  return (
    <Img
      src={ImageTwo}
      placeholder="lqip"
      width={wantedWidth}
      height={Math.round(wantedWidth / aspectRatio)}
    />
  );
};

const ThirdImg = () => {
  const width = 6000;
  const height = 4000;
  const aspectRatio = width / height;

  const wantedWidth = 750;

  return (
    <Img
      src={ImageThree}
      webp
      placeholder="lqip"
      width={wantedWidth}
      height={Math.round(wantedWidth / aspectRatio)}
    />
  );
};

const Home: React.FC<HomeProps> = () => {
  return (
    <>
      <FirstImg />
      <ThirdImg />
      <div style={{ paddingTop: '500em' }} />
      <SecondImg />
    </>
  );
};

export default Home;
