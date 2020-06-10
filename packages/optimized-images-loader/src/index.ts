import { loader } from 'webpack';
import { getOptions } from 'loader-utils';
import processImage from './processImage';
import parseQuery from './parseQuery';
import { LoaderOptions } from './options';
import processLoaders from './processLoaders';
import { getCache, setCache } from './cache';

/**
 * Optimized images loader
 * Called by webpack
 *
 * @param {Buffer} source Image to optimize
 * @returns {null} Calls the webpack callback once finished
 */
export default function optimizedImagesLoader(this: loader.LoaderContext, source: Buffer): null {
  const callback = this.async() as loader.loaderCallback;

  (async () => {
    const loaderOptions = getOptions(this) as LoaderOptions;

    // parse image options
    const imageOptions = parseQuery(this.resourceQuery, loaderOptions);

    let result: { data: Buffer | string | string[]; info: { width?: number; height?: number; format?: string } };

    // try retrieving the image from cache
    const cached = await getCache(source, imageOptions, loaderOptions);
    if (cached) {
      result = cached;
    } else {
      // process image
      result = await processImage(source, imageOptions, loaderOptions);

      // cache processed image
      setCache(source, result.data, result.info, imageOptions, loaderOptions);
    }

    // process further loaders
    const output = processLoaders(this, result.data, result.info, imageOptions, loaderOptions);

    callback(null, output);
  })();

  return null;
}

export const raw = true;
