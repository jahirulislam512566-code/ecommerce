"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react"
import { AddressForm } from "./address-form"

interface Address {
  id: string
  type: string
  name: string
  street: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses)
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: "PATCH",
      })
      if (response.ok) {
        await fetchAddresses()
      }
    } catch (error) {
      console.error("Error setting default address:", error)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return
    
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchAddresses()
      }
    } catch (error) {
      console.error("Error deleting address:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Address Book</h2>
        <button
          onClick={() => {
            setEditingAddress(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-6">Add your first address for faster checkout</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 relative ${
                address.isDefault ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                  Default
                </span>
              )}
              
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{address.name}</p>
                  <p className="text-sm text-gray-600">{address.street}</p>
                  {address.street2 && (
                    <p className="text-sm text-gray-600">{address.street2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                  {address.phone && (
                    <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1 capitalize">{address.type}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingAddress(address)
                    setShowForm(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {showForm && (
        <AddressForm
          address={editingAddress}
          onClose={() => {
            setShowForm(false)
            setEditingAddress(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingAddress(null)
            fetchAddresses()
          }}
        />
      )}
    </div>
  )
}