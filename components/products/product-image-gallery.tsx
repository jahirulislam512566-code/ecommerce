"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"

interface ProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
  order: number
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  selectedImage: number
  onImageSelect: (index: number) => void
  currentImage?: string
}

export function ProductImageGallery({
  images,
  selectedImage,
  onImageSelect,
  currentImage,
}: ProductImageGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [imageError, setImageError] = useState(false)

  const mainImageUrl = currentImage || images[selectedImage]?.url || "/placeholder-image.jpg"
  const mainImageAlt = images[selectedImage]?.altText || "Product image"

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Handle image error
  const handleImageError = () => {
    setImageError(true)
  }

  // If there are no images at all
  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={imageError ? "/placeholder-image.jpg" : mainImageUrl}
          alt={mainImageAlt}
          fill
          className={`object-cover transition-transform duration-200 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={{
            transformOrigin: isZoomed 
              ? `${zoomPosition.x}% ${zoomPosition.y}%`
              : 'center center',
          }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          onError={handleImageError}
        />
        
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => onImageSelect(index)}
              className={`
                relative aspect-square rounded-lg overflow-hidden bg-gray-100
                ${selectedImage === index ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-70 hover:opacity-100"}
              `}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url || "/placeholder-image.jpg"}
                alt={image.altText || `Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-image.jpg"
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}