"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category, CategoryTree } from "@/types/category";

async function fetchCategories(params?: {
  includeProducts?: boolean;
  withCount?: boolean;
  parentOnly?: boolean;
  tree?: boolean;
}): Promise<Category[] | CategoryTree[]> {
  const searchParams = new URLSearchParams();
  if (params?.includeProducts) searchParams.set("includeProducts", "true");
  if (params?.withCount) searchParams.set("withCount", "true");
  if (params?.parentOnly) searchParams.set("parentOnly", "true");
  if (params?.tree) searchParams.set("tree", "true");

  const response = await fetch(`/api/categories?${searchParams.toString()}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.categories;
}

async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const response = await fetch(`/api/categories/${slug}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.category;
}

async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.category;
}

async function updateCategory(slug: string, data: Partial<Category>): Promise<Category> {
  const response = await fetch(`/api/categories/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.category;
}

async function deleteCategory(slug: string): Promise<void> {
  const response = await fetch(`/api/categories/${slug}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
}

export function useCategories(params?: {
  includeProducts?: boolean;
  withCount?: boolean;
  parentOnly?: boolean;
  tree?: boolean;
}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => fetchCategories(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => fetchCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<Category> }) =>
      updateCategory(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", slug] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}