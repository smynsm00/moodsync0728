import JSZip from 'jszip';
import type { ImageAsset, ExportConfig } from '../types/moodsync';
import { renderImageToBlob } from './filterEngine';
import { generateJsonDesignTokens } from './tokenExtractor';

export interface ExportProgress {
  current: number;
  total: number;
  statusText: string;
}

export async function batchExportZip(
  images: ImageAsset[],
  config: ExportConfig,
  userTier: 'free' | 'premium',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();
  const imgFolder = zip.folder("images");
  const tokensFolder = zip.folder("design_tokens");
  
  const total = images.length;
  const maxDim = (userTier === 'free' || config.resolutionMode === '1080p') ? 1080 : undefined;
  const fileExt = config.format === 'json' ? 'jpg' : config.format;

  for (let i = 0; i < total; i++) {
    const img = images[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        statusText: `[${i + 1}/${total}] 렌더링 중: ${img.name}...`
      });
    }

    try {
      if (imgFolder && config.format !== 'json') {
        const blob = await renderImageToBlob(
          img.originalUrl,
          img.appliedParams,
          fileExt as 'jpg' | 'png' | 'webp',
          config.quality,
          maxDim
        );
        const baseName = img.name.replace(/\.[^/.]+$/, "");
        imgFolder.file(`${baseName}_moodsync.${fileExt}`, blob);
      }

      if (tokensFolder) {
        const tokenJson = generateJsonDesignTokens(img);
        const baseName = img.name.replace(/\.[^/.]+$/, "");
        tokensFolder.file(`${baseName}_tokens.json`, tokenJson);
      }
    } catch (err) {
      console.error(`Failed to process image ${img.name}:`, err);
    }
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      statusText: "📦 ZIP 압축 아카이브 생성 중..."
    });
  }

  const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
    if (onProgress && metadata.percent) {
      onProgress({
        current: total,
        total,
        statusText: `압축 진행률: ${Math.round(metadata.percent)}%`
      });
    }
  });

  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `MoodSync_Handoff_Package_${timestamp}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
