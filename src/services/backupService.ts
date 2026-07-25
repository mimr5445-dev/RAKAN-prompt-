/**
 * RAKAN Prompt - Backup, Import & Export Engine
 * Supports JSON, JSZip export/import with embedded images and smart duplicate resolution.
 */

import JSZip from 'jszip';
import { Section, Category, PromptItem, Tag, BackupData } from '../types';

export class BackupService {
  /**
   * Export JSON file
   */
  public static exportJSON(
    data: {
      sections: Section[];
      categories: Category[];
      prompts: PromptItem[];
      tags: Tag[];
    },
    filename = 'Rakan_Prompt_Library.json'
  ): void {
    const backup: BackupData = {
      version: '2.5.0',
      timestamp: new Date().toISOString(),
      sections: data.sections,
      categories: data.categories,
      prompts: data.prompts,
      tags: data.tags,
    };

    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export ZIP archive containing library metadata JSON + images
   */
  public static async exportZIP(
    data: {
      sections: Section[];
      categories: Category[];
      prompts: PromptItem[];
      tags: Tag[];
    },
    filename = 'Rakan_Prompt_Backup.zip'
  ): Promise<void> {
    const zip = new JSZip();

    // Clean prompt images for metadata and add images to separate zip folder
    const imagesFolder = zip.folder('images');
    const processedPrompts: PromptItem[] = [];

    let imageCounter = 0;

    for (const p of data.prompts) {
      const promptCopy = { ...p, images: [...p.images] };
      const zipImagePaths: string[] = [];

      for (let i = 0; i < p.images.length; i++) {
        const img = p.images[i];
        if (img.startsWith('data:image/')) {
          imageCounter++;
          const ext = img.startsWith('data:image/png') ? 'png' : 'jpg';
          const imgName = `img_${p.id}_${i + 1}.${ext}`;
          const base64Data = img.split(',')[1];
          if (imagesFolder && base64Data) {
            imagesFolder.file(imgName, base64Data, { base64: true });
            zipImagePaths.push(`images/${imgName}`);
          }
        } else {
          zipImagePaths.push(img);
        }
      }

      promptCopy.images = zipImagePaths;
      processedPrompts.push(promptCopy);
    }

    const backup: BackupData = {
      version: '2.5.0',
      timestamp: new Date().toISOString(),
      sections: data.sections,
      categories: data.categories,
      prompts: processedPrompts,
      tags: data.tags,
    };

    zip.file('metadata.json', JSON.stringify(backup, null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Parse uploaded file (JSON or ZIP)
   */
  public static async parseImportFile(file: File): Promise<BackupData> {
    if (file.name.endsWith('.zip')) {
      const zip = await JSZip.loadAsync(file);
      const metadataFile = zip.file('metadata.json');
      if (!metadataFile) {
        throw new Error('الملف المضغوط لا يحتوي على metadata.json الخاص بـ RAKAN Prompt');
      }

      const jsonText = await metadataFile.async('text');
      const backupData: BackupData = JSON.parse(jsonText);

      // Reconstruct base64 images from zip folder if stored as relative paths
      for (const p of backupData.prompts) {
        const restoredImages: string[] = [];
        for (const imgPath of p.images) {
          if (imgPath.startsWith('images/')) {
            const imgFile = zip.file(imgPath);
            if (imgFile) {
              const base64Data = await imgFile.async('base64');
              const mime = imgPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
              restoredImages.push(`data:${mime};base64,${base64Data}`);
            }
          } else {
            restoredImages.push(imgPath);
          }
        }
        p.images = restoredImages;
      }

      return backupData;
    } else {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      if (!backupData.sections || !backupData.prompts) {
        throw new Error('تنسيق ملف JSON غير متوافق مع RAKAN Prompt');
      }
      return backupData;
    }
  }

  /**
   * Calculate intelligent hash / duplicate key for a prompt
   */
  public static computePromptHash(title: string, prompt: string): string {
    return `${title.trim().toLowerCase()}||${prompt.trim().toLowerCase()}`;
  }
}
