"use client";
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { fetchContent, type ContentKind } from "@/lib/queries";

/** Lee de la caché hidratada (sin loading ni refetch inmediato gracias a staleTime). */
export function useContent<T>(key: QueryKey, kind: ContentKind, slug?: string) {
  return useQuery({ queryKey: key, queryFn: () => fetchContent<T>(kind, slug) }).data;
}
