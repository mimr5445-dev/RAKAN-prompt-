/**
 * RAKAN Prompt - Image Service Utilities
 * Image compression, base64 conversion, lazy thumbnail generator, SVG placeholders
 */

export class ImageService {
  /**
   * Convert File or Blob to Base64 data URL
   */
  public static fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress Image to reasonable mobile footprint (max width/height 1200px, JPEG quality 0.82)
   */
  public static compressImage(dataUrl: string, maxWidth = 1200, quality = 0.82): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
    });
  }

  /**
   * Create SVG Data URL thumbnail with custom text/title for prompt sample visuals
   */
  public static createGraphicPlaceholder(title: string, category: string, primaryColor = '#78350F'): string {
    const encodedTitle = encodeURIComponent(title || 'Prompt');
    const encodedCategory = encodeURIComponent(category || 'RAKAN Prompt');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="#1C1917" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#g)"/>
      <circle cx="520" cy="80" r="140" fill="#FFFFFF" fill-opacity="0.05" />
      <circle cx="80" cy="320" r="180" fill="#FFFFFF" fill-opacity="0.04" />
      <text x="300" y="190" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${encodedTitle}</text>
      <rect x="200" y="220" width="200" height="34" rx="17" fill="#FFFFFF" fill-opacity="0.15" />
      <text x="300" y="243" fill="#FDE68A" font-family="Arial, sans-serif" font-size="14" font-weight="500" text-anchor="middle">${encodedCategory}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${svg}`;
  }
}
