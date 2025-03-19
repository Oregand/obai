/**
 * Type definitions for Next.js components
 */

/**
 * Props interface for Next.js pages with searchParams
 */
export interface PageProps {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Type for route handlers and API endpoints
 */
export interface RouteHandlerParams {
  params?: { [key: string]: string };
}
