import { Blog } from '../types/ecommerce';

/**
 * Normalizes an image URL to ensure proper format across all devices and environments.
 * - Handles relative URLs (e.g. "uploads/..." -> "/uploads/...")
 * - Preserves data URLs (data:image/...)
 * - Preserves absolute URLs (http://, https://)
 * - Returns clean trimmed string or empty string
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a full URL or data URI
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//')
  ) {
    return trimmed;
  }

  // Relative path without leading slash
  if (trimmed.startsWith('uploads/')) {
    return '/' + trimmed;
  }

  // Clean backslashes to forward slashes (e.g. from Windows paths)
  if (trimmed.includes('\\')) {
    const fixed = trimmed.replace(/\\+/g, '/');
    return fixed.startsWith('/') ? fixed : '/' + fixed;
  }

  return trimmed;
}

/**
 * Extracts the best available image URL from any blog object variant.
 * Checks featured_image, cover_image, image_url, image.
 */
export function getBlogImageUrl(blog?: Partial<Blog> | Record<string, any> | null): string {
  if (!blog || typeof blog !== 'object') return '';
  const anyBlog = blog as any;
  const raw =
    anyBlog.featured_image ||
    anyBlog.cover_image ||
    anyBlog.image_url ||
    anyBlog.image ||
    '';
  return normalizeImageUrl(raw);
}

export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Compresses and scales an image File on the client side using HTML5 Canvas.
 * - Fits into optimal 16:9 blog widescreen format (max 1280x720)
 * - Converts to optimized WebP (or JPEG fallback)
 * - Reduces multi-megabyte camera/phone photos to ~60-120 KB
 * - Guarantees rapid upload and multi-device cross-browser rendering
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 720,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // If browser doesn't support FileReader or Canvas, fallback to raw read
    if (typeof window === 'undefined' || !window.FileReader || !window.document) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          dataUrl: result,
          width: 800,
          height: 450,
          sizeBytes: file.size
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // If Image fails to decode, resolve with original base64
        resolve({
          dataUrl: (e.target?.result as string) || '',
          width: 800,
          height: 450,
          sizeBytes: file.size
        });
      };

      img.onload = () => {
        try {
          let origW = img.naturalWidth || img.width;
          let origH = img.naturalHeight || img.height;

          if (!origW || !origH) {
            origW = 800;
            origH = 450;
          }

          // Compute target dimensions while preserving aspect ratio
          let targetW = origW;
          let targetH = origH;

          if (targetW > maxWidth || targetH > maxHeight) {
            const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
            targetW = Math.round(targetW * ratio);
            targetH = Math.round(targetH * ratio);
          }

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({
              dataUrl: (e.target?.result as string) || '',
              width: targetW,
              height: targetH,
              sizeBytes: file.size
            });
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, targetW, targetH);

          // Attempt WebP export, fallback to JPEG
          let dataUrl = '';
          try {
            dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          const approxBytes = Math.round((dataUrl.length * 3) / 4);

          resolve({
            dataUrl,
            width: targetW,
            height: targetH,
            sizeBytes: approxBytes
          });
        } catch (err) {
          // Fallback to original
          resolve({
            dataUrl: (e.target?.result as string) || '',
            width: 800,
            height: 450,
            sizeBytes: file.size
          });
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
