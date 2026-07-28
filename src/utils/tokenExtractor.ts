import type { ImageAsset } from '../types/moodsync';
import { getCssFilterString } from './filterEngine';

export function generateJsonDesignTokens(image: ImageAsset): string {
  const paletteObj: Record<string, { value: string; type: string; comment: string }> = {};
  
  image.colorPalette.forEach((token, index) => {
    const key = index === 0 ? 'dominant' : index === 1 ? 'secondary' : index === 2 ? 'accent' : `neutral_${index}`;
    paletteObj[key] = {
      value: token.hex,
      type: 'color',
      comment: `${token.name} - Contrast: ${token.contrastRatio}`
    };
  });

  const tokenSchema = {
    $schema: "https://tokens.studio/schema/design-tokens.json",
    moodsync: {
      asset_id: image.id,
      asset_name: image.name,
      generated_at: new Date().toISOString(),
      color_palette: paletteObj,
      style_filter: {
        css_value: {
          value: getCssFilterString(image.appliedParams),
          type: "custom-css",
          comment: "Apply to CSS filter property"
        },
        parameters: {
          brightness: { value: `${image.appliedParams.brightness}%`, type: "dimension" },
          contrast: { value: `${image.appliedParams.contrast}%`, type: "dimension" },
          saturation: { value: `${image.appliedParams.saturation}%`, type: "dimension" },
          temperature: { value: `${image.appliedParams.temperature}`, type: "number" },
          tint: { value: `${image.appliedParams.tint}`, type: "number" }
        }
      }
    }
  };

  return JSON.stringify(tokenSchema, null, 2);
}

export function downloadJsonTokens(image: ImageAsset): void {
  const jsonString = generateJsonDesignTokens(image);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `moodsync_tokens_${image.name.replace(/\.[^/.]+$/, "")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
