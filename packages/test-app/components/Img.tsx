export interface ImgProps {}

const Img: React.FC<ImgProps> = () => {
  const details = require('../images/test.jpg?trace&resize&width=100&url');
  console.log(details);
  return <img src={details.src} width={1000} />;
};

export default Img;
