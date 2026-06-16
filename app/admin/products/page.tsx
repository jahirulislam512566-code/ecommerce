"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Download,
  AlertCircle,
  RefreshCw,
  Package
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  quantity: number;
  status: string;
  visibility: string;
  featured: boolean;
  images: { url: string }[];
  createdAt: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, { 
        method: "DELETE" 
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        setSelectedProducts(prev => prev.filter(pid => pid !== id));
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete product");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedProducts.length === 0) return;
    
    if (action === "delete" && !confirm(`Delete ${selectedProducts.length} products?`)) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productIds: selectedProducts,
        }),
      });
      
      if (response.ok) {
        await fetchProducts();
        setSelectedProducts([]);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Bulk action failed");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to perform bulk action");
      console.error("Error in bulk action:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400", label: "Active" },
      INACTIVE: { color: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400", label: "Inactive" },
      DISCONTINUED: { color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400", label: "Discontinued" },
    };
    const { color, label } = config[status as keyof typeof config] || config.INACTIVE;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  // Product row skeleton
  const ProductSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
      <td className="px-4 py-3"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></td>
      <td className="px-4 py-3"><div className="flex gap-1"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div></div></td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => fetchProducts()}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>
          <button 
            onClick={() => fetchProducts()}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction("activate")}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("deactivate")}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Processing..." : "Delete"}
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter !== "all" 
                ? "Try adjusting your filters or search terms"
                : "Get started by adding your first product"}
            </p>
            {(search || statusFilter !== "all") ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/admin/products/new"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">SKU</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{product.sku}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-gray-500 line-through">${product.comparePrice.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${product.quantity <= 5 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="View product"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                          title="More options"
                          onClick={() => {
                            // Show a simple dropdown with options
                            const options = [
                              { label: 'Duplicate', action: 'duplicate' },
                              { label: 'Archive', action: 'archive' },
                              { label: 'Export', action: 'export' }
                            ];
                            // Simple alert for now
                            const optionList = options.map((opt, i) => `${i + 1}. ${opt.label}`).join('\n');
                            alert(`Options for: ${product.name}\n\n${optionList}`);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Count */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}
    </div>
  );
}