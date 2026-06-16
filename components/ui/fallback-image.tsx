"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface FallbackImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function FallbackImage({
  src,
  alt,
  fill = false,
  width = 100,
  height = 100,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (hasError || !imgSrc || imgSrc === "") {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  // Create base props without optional fields
  const baseProps = {
    src: imgSrc,
    alt: alt,
    sizes: sizes,
    priority: priority,
    className: className,
    onError: () => {
      setHasError(true);
      setImgSrc("/placeholder.jpg");
    },
  };

  // If fill is true, use fill prop and omit width/height
  if (fill) {
    return <Image {...baseProps} fill />;
  }

  // Otherwise, include width and height
  return <Image {...baseProps} width={width} height={height} />;
}