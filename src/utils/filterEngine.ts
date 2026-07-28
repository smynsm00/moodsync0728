import type { FilterParams } from '../types/moodsync';

export function getCssFilterString(params: FilterParams, overrideCss?: string): string {
  if (overrideCss && overrideCss.trim() !== '') {
    const baseBrightness = params.brightness !== 100 ? ` brightness(${params.brightness}%)` : '';
    const baseContrast = params.contrast !== 100 ? ` contrast(${params.contrast}%)` : '';
    const baseSaturation = params.saturation !== 100 ? ` saturate(${params.saturation}%)` : '';
    return `${overrideCss}${baseBrightness}${baseContrast}${baseSaturation}`.trim();
  }

  const tempShift = params.temperature * 0.4;
  const tintShift = params.tint * 0.4;
  const effectiveHue = params.hueRotate + tempShift + tintShift;

  const filters: string[] = [
    `brightness(${params.brightness}%)`,
    `contrast(${params.contrast}%)`,
    `saturate(${params.saturation}%)`,
  ];

  if (params.sepia > 0) {
    filters.push(`sepia(${params.sepia}%)`);
  }

  if (Math.abs(effectiveHue) > 0.1) {
    filters.push(`hue-rotate(${Math.round(effectiveHue)}deg)`);
  }

  return filters.join(' ');
}

export async function renderImageToBlob(
  imageUrl: string,
  params: FilterParams,
  format: 'jpg' | 'png' | 'webp' = 'jpg',
  quality: number = 0.9,
  maxDimension?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (maxDimension && (width > maxDimension || height > maxDimension)) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context'));
        return;
      }

      ctx.filter = getCssFilterString(params);
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        mimeType,
        quality
      );
    };

    img.onerror = (err) => reject(err || new Error('Image loading failed'));
    img.src = imageUrl;
  });
}
