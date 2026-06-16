"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { Trash2, Plus, Upload } from "lucide-react"

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  comparePrice: z.number().optional(),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().min(0, "Stock quantity must be positive"),
  lowStockThreshold: z.number().min(0).default(5),
  categoryId: z.string().optional(),
  featured: z.boolean().default(false),
  tags: z.string().optional(),
  weight: z.number().optional(),
  images: z.array(z.object({
    url: z.string(),
    altText: z.string().optional(),
    isPrimary: z.boolean(),
    order: z.number(),
  })).default([]),
  variants: z.array(z.object({
    sku: z.string(),
    name: z.string().optional(),
    attributes: z.record(z.string()),
    price: z.number().optional(),
    comparePrice: z.number().optional(),
    quantity: z.number(),
    image: z.string().optional(),
  })).default([]),
})

type ProductFormData = z.infer<typeof productSchema>

// Available attributes
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
const AVAILABLE_COLORS = [
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#00FF00" },
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Purple", value: "#800080" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Gray", value: "#808080" },
  { name: "Brown", value: "#A52A2A" },
]

export function ProductForm() {
  const [uploading, setUploading] = useState(false)
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      images: [],
      variants: [],
      featured: false,
      lowStockThreshold: 5,
    },
  })

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })

  const watchImages = watch("images")
  const watchVariants = watch("variants")

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Process tags
      const tags = data.tags?.split(",").map(tag => tag.trim()).filter(Boolean) || []
      
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tags }),
      })
      
      if (!response.ok) throw new Error("Failed to create product")
      
      // Redirect or show success
      window.location.href = "/admin/products"
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Failed to create product")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    setUploading(true)
    
    // Upload each file
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (response.ok) {
        const { url } = await response.json()
        appendImage({
          url,
          altText: file.name,
          isPrimary: watchImages.length === 0, // First image is primary
          order: watchImages.length,
        })
      }
    }
    
    setUploading(false)
  }

  const generateVariants = () => {
    // Get selected attributes from form
    const sizes = (document.querySelector("[name=variantSizes]") as HTMLSelectElement)?.selectedOptions
    const colors = (document.querySelector("[name=variantColors]") as HTMLSelectElement)?.selectedOptions
    
    if (!sizes?.length && !colors?.length) {
      alert("Select at least one size or color")
      return
    }
    
    const sizeList = sizes ? Array.from(sizes).map(s => s.value) : [""]
    const colorList = colors ? Array.from(colors).map(c => c.value) : [""]
    
    const newVariants: any[] = []
    
    for (const size of sizeList) {
      for (const color of colorList) {
        if (size || color) {
          const attributes: Record<string, string> = {}
          if (size) attributes.size = size
          if (color) attributes.color = color
          
          const variantName = [size, color].filter(Boolean).join(" - ")
          
          newVariants.push({
            sku: `${watch("sku")}-${variantName.replace(/ /g, "-")}`,
            name: variantName,
            attributes,
            quantity: 0,
          })
        }
      }
    }
    
    newVariants.forEach(variant => appendVariant(variant))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              {...register("slug")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="product-name"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <input
              {...register("sku")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compare Price (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("comparePrice", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              {...register("lowStockThreshold", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("weight", { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              {...register("tags")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="new, sale, popular"
            />
          </div>
          
          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("featured")}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            {...register("shortDescription")}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Description *
          </label>
          <textarea
            {...register("description")}
            rows={6}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>
      
      {/* Product Images */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product Images</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4 inline mr-2" />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageFields.map((field, index) => (
            <div key={field.id} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border">
                <Image
                  src={watchImages[index]?.url}
                  alt={watchImages[index]?.altText || "Product image"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={watchImages[index]?.isPrimary || false}
                    onChange={(e) => {
                      setValue(`images.${index}.isPrimary`, e.target.checked)
                      if (e.target.checked) {
                        // Unset other primary images
                        watchImages.forEach((_, i) => {
                          if (i !== index) setValue(`images.${i}.isPrimary`, false)
                        })
                      }
                    }}
                  />
                  Primary Image
                </label>
                <input
                  type="text"
                  placeholder="Alt text"
                  {...register(`images.${index}.altText`)}
                  className="mt-1 w-full text-sm px-2 py-1 border rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Product Variants */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product Variants (Size/Color)</h2>
        
        {/* Generate Variants Tool */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Generate Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sizes
              </label>
              <select
                name="variantSizes"
                multiple
                className="w-full px-3 py-2 border rounded-lg"
                size={4}
              >
                {AVAILABLE_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors
              </label>
              <select
                name="variantColors"
                multiple
                className="w-full px-3 py-2 border rounded-lg"
                size={4}
              >
                {AVAILABLE_COLORS.map(color => (
                  <option key={color.name} value={color.name}>{color.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={generateVariants}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Generate Variants
          </button>
        </div>
        
        {/* Variants List */}
        <div className="space-y-4">
          {variantFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">
                  Variant: {watchVariants[index]?.name || `Variant ${index + 1}`}
                </h3>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    {...register(`variants.${index}.sku`)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`variants.${index}.price`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    {...register(`variants.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              
              {/* Display attributes */}
              {watchVariants[index]?.attributes && (
                <div className="mt-3 text-sm text-gray-600">
                  Attributes: {Object.entries(watchVariants[index].attributes).map(([key, value]) => (
                    <span key={key} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {variantFields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No variants added. Use the generator above or add manually.
          </div>
        )}
      </div>
      
      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  )
}