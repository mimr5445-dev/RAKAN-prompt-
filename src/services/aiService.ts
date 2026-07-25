/**
 * RAKAN Prompt - AI Prompt Optimization Service
 * Provides intelligent prompt enhancement for Stable Diffusion, Midjourney, DALL-E 3 & Flux
 */

export class AIService {
  /**
   * Optimize or enhance a prompt using local templates or backend proxy
   */
  public static async optimizePrompt(
    originalPrompt: string,
    targetEngine: 'midjourney' | 'sdxl' | 'dalle3' | 'flux' = 'midjourney',
    language: 'ar' | 'en' = 'ar'
  ): Promise<{ enhancedPrompt: string; negativePrompt?: string; tips: string[] }> {
    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: originalPrompt, engine: targetEngine, language }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhancedPrompt) return data;
      }
    } catch {
      // Fallback to local intelligent offline enhancer
    }

    return this.offlineEnhancer(originalPrompt, targetEngine, language);
  }

  private static offlineEnhancer(
    prompt: string,
    engine: string,
    lang: string
  ): { enhancedPrompt: string; negativePrompt?: string; tips: string[] } {
    let enhanced = prompt.trim();

    if (!enhanced.includes('8k') && !enhanced.includes('photorealistic')) {
      enhanced += ', 8k resolution, highly detailed, professional lighting, photorealistic, octane render, 35mm photograph, cinematic composition';
    }

    if (engine === 'midjourney' && !enhanced.includes('--v')) {
      enhanced += ' --v 6.0 --style raw --ar 16:9';
    }

    const negative = 'blurry, low quality, distorted anatomy, extra limbs, watermark, text, grainy, out of frame, signature';

    const tips = lang === 'ar'
      ? ['تم تحسين الإضاءة والتفاصيل الدقيقة.', 'تم تكييف الأمر ليتناسب مع محركات التوليد الحديثة.']
      : ['Enhanced lighting and fine details.', 'Tailored command structure for AI generation models.'];

    return {
      enhancedPrompt: enhanced,
      negativePrompt: negative,
      tips,
    };
  }
}
