"use client";

import { useState, useEffect } from "react";
import { Mail, Calendar, Shield,  Trash2, Search } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="VENDOR">Vendors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {/* Fixed line: Safely checks both name and email fallback bounds */}
                  {user.name?.[0] || (user.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1 dark:bg-gray-700"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white">{user.name || "No name"}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Shield className="w-3 h-3" />
                {user.role}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-4 pt-3 border-t dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user._count?.orders ?? 0} orders placed
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}