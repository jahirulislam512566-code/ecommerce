"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  quality = 80,
  containerClassName = "",
  objectFit = "cover",
  onLoad,
  onError,
  placeholder = "empty",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  // Build props conditionally
  const imageProps: any = {
    src: error ? "/placeholder-image.jpg" : src,
    alt,
    sizes,
    priority,
    quality,
    className: cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      // Apply object-fit using className
      objectFit === "cover" && "object-cover",
      objectFit === "contain" && "object-contain",
      objectFit === "fill" && "object-fill",
      objectFit === "none" && "object-none",
      objectFit === "scale-down" && "object-scale-down",
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    placeholder,
    ...(blurDataURL && { blurDataURL }),
    ...(fill && { fill }),
    ...(!fill && { width, height }),
  };

  // If fill is true, don't include width/height
  if (fill) {
    delete imageProps.width;
    delete imageProps.height;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        containerClassName
      )}
      style={
        !fill && width && height
          ? { width: `${width}px`, height: `${height}px` }
          : undefined
      }
    >
      <Image {...imageProps} />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}