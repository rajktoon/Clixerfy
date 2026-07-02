/**
 * Image optimization utilities for remote images (Strapi/WordPress)
 */

/**
 * Generate responsive srcset for WordPress/Strapi images
 * WordPress generates multiple sizes that can be accessed via URL patterns
 */
export function getResponsiveSrcSet(url: string, sizes: number[] = [320, 640, 960, 1280]): string {
  if (!url) return '';
  
  // For WordPress images, generate srcset with different widths
  // WordPress typically creates sizes like: -300x150, -600x300, -768x384, etc.
  return sizes
    .map(w => `${getResizedImageUrl(url, w)} ${w}w`)
    .join(', ');
}

/**
 * Get resized image URL for WordPress/Strapi images
 * Attempts to use WordPress's built-in resizing or image CDN
 */
export function getResizedImageUrl(url: string, width: number): string {
  if (!url) return '';
  
  // If it's a WordPress URL, try to use their resize pattern
  if (url.includes('/wp-content/uploads/')) {
    // Try WordPress resize pattern: insert -WxH before extension
    const ext = url.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[0] || '.jpg';
    const baseUrl = url.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
    // Estimate height based on common aspect ratios (16:9 or 2:1)
    const height = Math.round(width * 0.5);
    return `${baseUrl}-${width}x${height}${ext}`;
  }
  
  // For Strapi or other URLs, return as-is (could be enhanced with CDN params)
  return url;
}

/**
 * Get sizes attribute for responsive images
 */
export function getResponsiveSizes(maxWidth: number = 1200): string {
  return `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`;
}
