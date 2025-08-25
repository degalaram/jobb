// client/src/lib/api.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";

/* ---------------------------
   Config: API Origin
   --------------------------- */
// Default: same-origin (for single Render deployment)
// If VITE_API_URL is set, use it instead (for two-service setup)
const API_ORIGIN =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/+$/, "") || "";

/* ---------------------------
   URL Helpers
   --------------------------- */
function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u);
}

function ensureApiPath(pathOrUrl: string) {
  let p = pathOrUrl.trim();
  if (isAbsoluteUrl(p)) return p; // already full URL
  if (!p.startsWith("/")) p = "/" + p;
  if (!/^\/api(\/|$)/.test(p)) p = "/api" + p; // add "/api" if missing
  return p;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (isAbsoluteUrl(pathOrUrl)) return pathOrUrl;
  return API_ORIGIN ? `${API_ORIGIN}${pathOrUrl}` : pathOrUrl;
}

function toApiUrl(pathOrUrl: string) {
  return toAbsoluteUrl(ensureApiPath(pathOrUrl));
}

/* ---------------------------
   Error Handling
   --------------------------- */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/* ---------------------------
   Imperative Request Helper
   --------------------------- */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const finalUrl = toApiUrl(url);

  const res = await fetch(finalUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/* ---------------------------
   React Query Integration
   --------------------------- */
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const rawPath = (queryKey as readonly unknown[])
      .map(String)
      .filter(Boolean)
      .join("/");

    // Normalize to always start with "/api/..."
    const normalizedPath =
      rawPath.startsWith("api/") || rawPath === "api"
        ? `/${rawPath}`
        : `/api/${rawPath}`;

    const url = toAbsoluteUrl(normalizedPath);

    const res = await fetch(url, { credentials: "include" });

    if (on401 === "returnNull" && res.status === 401) {
      return null as unknown as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
