import React, { useState } from 'react';
import { normalizeImageUrl } from '../../utils/imageHelper';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  alt: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  className = '',
  ...props
}) => {
  const normalized = normalizeImageUrl(src);
  const [imgSrc, setImgSrc] = useState<string>(normalized || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  React.useEffect(() => {
    const validUrl = normalizeImageUrl(src);
    setImgSrc(validUrl || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};
