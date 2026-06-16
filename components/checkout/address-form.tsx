"use client";

import { MapPin, Phone, User, Home } from "lucide-react";

interface AddressFormProps {
  formData: {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function AddressForm({ formData, setFormData }: AddressFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">First Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User className="w-4 h-4" /></span>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="block w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="John" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="block w-full px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="Doe" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Street Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Home className="w-4 h-4" /></span>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main Street" className="block w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Apartment, suite, etc. (optional)</label>
          <input type="text" name="apartment" value={formData.apartment} onChange={handleChange} placeholder="Apt 4B" className="block w-full px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">City</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="New York" className="block w-full px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">State</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="NY" className="block w-full px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Postal Code</label>
            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="10001" className="block w-full px-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">Phone Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Phone className="w-4 h-4" /></span>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="block w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}