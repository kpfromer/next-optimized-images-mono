import querystring from 'querystring';
import { LoaderOptions } from './options';

export interface ImageOptions {
  optimize: boolean;
  resize: boolean;
  width?: number;
  height?: number;
  convert?: 'webp';
  forceInline?: boolean;
}

/**
 * Parses a query string into image options
 *
 * @param {string} rawQuery Resource query
 * @param {{ width?: number; height?: number }} imageInfo Metadata of the image
 * @param {LoaderOptions} loaderOptions Optimized images loader options
 * @returns {ImageOptions} Image options
 */
const parseQuery = (
  rawQuery: string,
  imageInfo: { width?: number; height?: number },
  loaderOptions: LoaderOptions,
): ImageOptions => {
  const query = querystring.parse(rawQuery.substr(0, 1) === '?' ? rawQuery.substr(1) : rawQuery);
  const options: ImageOptions = {
    optimize: loaderOptions.optimize !== false,
    resize: false,
  };

  // disable optimization
  if (typeof query.original !== 'undefined') {
    options.optimize = false;
  }

  // force inline
  if (typeof query.inline !== 'undefined') {
    options.forceInline = true;
  }

  // resize image
  if (typeof query.width === 'string') {
    options.width = parseInt(query.width, 10);
    options.resize = true;
  }
  if (typeof query.height === 'string') {
    options.height = parseInt(query.height, 10);
    options.resize = true;
  }

  // convert image to webp
  if (typeof query.webp !== 'undefined') {
    options.convert = 'webp';
  }

  // return low quality image placeholder
  if (typeof query.lqip !== 'undefined') {
    options.resize = true;
    options.optimize = false;

    if (!imageInfo.width || !imageInfo.height) {
      options.width = 10;
      options.height = 10;
    } else if (imageInfo.width > imageInfo.height) {
      options.width = 10;
      options.height = Math.round((10 / imageInfo.width) * imageInfo.height);
    } else {
      options.height = 10;
      options.width = Math.round((10 / imageInfo.height) * imageInfo.width);
    }
  }

  return options;
};

export default parseQuery;
