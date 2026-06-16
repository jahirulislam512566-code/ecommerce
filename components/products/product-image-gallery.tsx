"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

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
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  const mainImageUrl = currentImage || images[selectedImage]?.url
  const mainImageAlt = images[selectedImage]?.altText || "Product image"

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
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
          src={mainImageUrl}
          alt={mainImageAlt}
          fill
          className={`object-cover transition-transform duration-200 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
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
            >
              <Image
                src={image.url}
                alt={image.altText || `Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* No Images State */}
      {images.length === 0 && (
        <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      )}
    </div>
  )
}