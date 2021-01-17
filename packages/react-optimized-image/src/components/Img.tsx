import React, {
  ReactElement,
  DetailedHTMLProps,
  ImgHTMLAttributes,
  CSSProperties,
  useState,
  useEffect,
  useRef,
} from 'react';
import { ImgSrc } from './types';

export interface BaseImgProps
  extends Omit<
    Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'sizes' | 'placeholder'>,
    'src'
  > {
  src: ImgSrc;
  type?: string;
  webp?: boolean;
  inline?: boolean;
  placeholder?: boolean;
  url?: boolean;
  original?: boolean;
  sizes?: number[];
  densities?: number[];
  breakpoints?: number[];
  width?: number;
  height?: number;

  loading?: 'lazy' | 'eager'; // 'auto'

  fadeIn?: boolean;
  durationFadeIn?: number;
}
interface ImgInnerProps {
  rawSrc: {
    fallback: Record<number | string, Record<number, ImgSrc>>;
    webp?: Record<number | string, Record<number, ImgSrc>>;
    placeholder?: ImgSrc;
  };
}

const buildSrcSet = (densities: Record<number, ImgSrc>): string => {
  return ((Object.keys(densities) as unknown) as number[])
    .map((density) => {
      if (`${density}` === '1') {
        return densities[density].src;
      }

      return `${densities[density].src} ${density}x`;
    })
    .join(', ');
};

const getImageType = (densities: Record<number, ImgSrc>): string => {
  const keys = (Object.keys(densities) as unknown) as number[];
  return densities[keys[keys.length - 1]].format;
};

const buildSources = (
  type: Record<number | string, Record<number, ImgSrc>>,
  sizes: Array<number | string>,
  breakpoints?: number[],
): ReactElement[] => {
  return sizes.map((size, i) => {
    const densities = type[size];
    const imageType = `image/${getImageType(densities)}`;
    let media;

    if (size === 'original' || sizes.length === 0 || !breakpoints || i > breakpoints.length) {
      // only one size
      media = undefined;
    } else if (i === 0) {
      // first size
      media = `(max-width: ${breakpoints[i]}px)`;
    } else if (i === sizes.length - 1) {
      // last size
      media = `(min-width: ${breakpoints[i - 1] + 1}px)`;
    } else {
      media = `(min-width: ${breakpoints[i - 1] + 1}px) and (max-width: ${breakpoints[i]}px)`;
    }

    return <source key={`${imageType}/${size}`} type={imageType} srcSet={buildSrcSet(densities)} media={media} />;
  });
};

const findFallbackImage = (src: ImgSrc, rawSrc: ImgInnerProps['rawSrc']): ImgSrc => {
  let fallbackImage = src;

  if (rawSrc.fallback) {
    const biggestSize = Object.keys(rawSrc.fallback)
      .map((key) => parseInt(key, 10))
      .sort((a, b) => b - a)
      .find(() => true);

    if (biggestSize) {
      const lowestDensity = Object.keys(rawSrc.fallback[biggestSize])
        .map((key) => parseInt(key, 10))
        .sort((a, b) => a - b)
        .find(() => true);

      if (lowestDensity) {
        fallbackImage = rawSrc.fallback[biggestSize][lowestDensity];
      }
    }
  }

  return fallbackImage;
};
export interface CustomImgProps extends ImgHTMLAttributes<HTMLImageElement> {}

const CustomImg: React.FC<CustomImgProps> = (props) => {
  return (
    <img
      {...props}
      style={{
        position: `absolute`,
        top: 0,
        left: 0,
        width: `100%`,
        height: `100%`,
        objectFit: `cover`,
        objectPosition: `center`,
        ...props?.style,
      }}
    />
  );
};

let io: undefined | IntersectionObserver;
const ioListeners = new WeakMap();

function getIO(): undefined | IntersectionObserver {
  // Checks that we are in a browser that supports IntersectionObserver
  if (typeof io === `undefined` && typeof window !== `undefined` && window.IntersectionObserver) {
    io = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (ioListeners.has(entry.target)) {
            const cb = ioListeners.get(entry.target);
            // Edge doesn't currently support isIntersecting, so also test for an intersectionRatio > 0
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              io?.unobserve(entry.target);
              ioListeners.delete(entry.target);
              cb();
            }
          }
        });
      },
      { rootMargin: `200px` },
    );
  }

  return io;
}

function withIntersectionObserver() {}

/**
 * Listens for element intersections.
 * @param el The elemen to listen for intersections.
 * @param cb The function called when an intersection occurs.
 * @returns A function to remove listener for `el` (cleanup function)
 */
const listenToIntersections = (el: HTMLElement, cb: () => void) => {
  const observer = getIO();

  if (observer) {
    observer.observe(el);
    ioListeners.set(el, cb);
  }

  return () => {
    observer?.unobserve(el);
    ioListeners.delete(el);
  };
};

// Native lazy-loading support: https://addyosmani.com/blog/lazy-loading/
const hasNativeLazyLoadSupport = typeof HTMLImageElement !== `undefined` && `loading` in HTMLImageElement.prototype;
const isBrowser = typeof window !== `undefined`;
const hasIOSupport = isBrowser && window.IntersectionObserver;

/* eslint-disable @typescript-eslint/no-unused-vars */
const Img = ({
  src,
  type,
  webp,
  inline,
  url,
  original,
  sizes,
  densities,
  breakpoints,
  placeholder,
  height: wantedHeight,
  width: wantedWidth,
  fadeIn = true,
  durationFadeIn = 500,
  // Better to default to lazy and let users opt out
  loading = 'lazy',
  style,
  ...props
}: BaseImgProps): ReactElement | null => {
  const styles: CSSProperties = { ...(style || {}) };
  const { rawSrc, ...imgProps } = props as ImgInnerProps;

  // If this image has already been loaded before then we can assume it's
  // already in the browser cache so it's cheap to just show directly.
  const seenBefore = false; // isBrowser && inImageCache(props);

  const isCritical = loading === `eager`;

  const addNoScript = !(isCritical && !fadeIn);
  const useIOSupport = !hasNativeLazyLoadSupport && hasIOSupport && !isCritical && !seenBefore;

  const [isVisible, setIsVisible] = useState(isCritical || (isBrowser && (hasNativeLazyLoadSupport || !useIOSupport)));
  const [imgLoaded, setImgLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Listen to element intersection
  useEffect(() => {
    if (useIOSupport && elementRef.current) {
      const removeListener = listenToIntersections(elementRef.current, () => {
        console.log('in view');
        setIsVisible(true);
        setImgLoaded(true);
      });
      return removeListener;
    }
  }, [elementRef]);

  if (!rawSrc) {
    throw new Error(
      "Babel plugin 'react-optimized-image/plugin' not installed or this component could not be recognized by it.",
    );
  }

  // find fallback image
  const fallbackImage = findFallbackImage(src, rawSrc);

  const width = wantedWidth ?? fallbackImage.width;
  const height = wantedHeight ?? fallbackImage.height;
  const aspectRatio = width / height;

  // const ready = false;

  const shouldReveal = !fadeIn || imgLoaded;
  const shouldFadeIn = fadeIn; //&& imgLoaded;

  const imageStyle = {
    opacity: shouldReveal ? 1 : 0,
    transition: shouldFadeIn ? `opacity ${durationFadeIn}ms` : `none`,
    // ...imgStyle
  };

  const delayHideStyle = { transitionDelay: `${durationFadeIn}ms` };

  const imagePlaceholderStyle = {
    opacity: imgLoaded ? 0 : 1,
    ...(shouldFadeIn && delayHideStyle),
  };

  // return normal image tag if only 1 version is needed
  if (
    !rawSrc.webp &&
    Object.keys(rawSrc.fallback).length === 1 &&
    Object.keys(rawSrc.fallback[(Object.keys(rawSrc.fallback)[0] as unknown) as number]).length === 1
  ) {
    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'inline-block',
          width,
          height,
        }}
        ref={elementRef}
        // Supress hydration warning since it will not be render on ssr
        suppressHydrationWarning={true}
      >
        {/* Preserve the aspect ratio. */}
        <div aria-hidden style={{ width: '100%', paddingBottom: `${100 / aspectRatio}%` }} />

        {rawSrc.placeholder && <CustomImg src={rawSrc.placeholder.src} style={imagePlaceholderStyle} />}

        {isVisible && (
          <CustomImg
            src={fallbackImage.toString()}
            loading="lazy"
            onLoad={() => {
              setImgLoaded(true);
            }}
            {...imgProps}
            style={{ ...imageStyle, ...styles }}
          />
        )}
      </div>
    );
  }

  // TODO: match above changes
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-block',
        width,
        height,
      }}
      ref={elementRef}
      // Supress hydration warning since it will not be render on ssr
      suppressHydrationWarning={true}
    >
      {/* Preserve the aspect ratio. */}
      <div aria-hidden style={{ width: '100%', paddingBottom: `${100 / aspectRatio}%` }} />

      {rawSrc.placeholder && <CustomImg src={rawSrc.placeholder.src} style={imagePlaceholderStyle} />}

      {isVisible && (
        <picture>
          {rawSrc.webp &&
            buildSources(
              rawSrc.webp,
              sizes || ((Object.keys(rawSrc.webp) as unknown) as (number | string)[]),
              breakpoints || sizes,
            )}
          {buildSources(
            rawSrc.fallback,
            sizes || ((Object.keys(rawSrc.fallback) as unknown) as (number | string)[]),
            breakpoints || sizes,
          )}

          <CustomImg
            src={fallbackImage.toString()}
            loading={loading}
            onLoad={() => {
              setImgLoaded(true);
            }}
            {...imgProps}
            style={{ ...imageStyle, ...styles }}
          />
        </picture>
      )}
    </div>
  );
};

export default Img;
