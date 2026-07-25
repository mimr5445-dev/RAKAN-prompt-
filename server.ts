import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API endpoint for AI Prompt Optimization
  app.post('/api/optimize-prompt', async (req, res) => {
    try {
      const { prompt, engine, language } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt content is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          enhancedPrompt: `${prompt}, 8k resolution, highly detailed, professional cinematic lighting, photorealistic, masterpiece`,
          negativePrompt: 'blurry, distorted, low quality, watermark, extra limbs',
          tips: ['Enhanced using local default engine (Gemini key not configured).'],
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are a world-class AI Image Prompt Engineer specializing in Midjourney, SDXL, Flux, and DALL-E 3.
Given an input prompt, enhance it to achieve breathtaking photorealistic, artistic quality.
Return ONLY a valid JSON object with the following structure:
{
  "enhancedPrompt": "the detailed English prompt with lighting, camera angle, and style descriptors",
  "negativePrompt": "negative prompt tokens to avoid unwanted artifacts",
  "tips": ["short tip in ${language === 'ar' ? 'Arabic' : 'English'} explaining the enhancements made"]
}`;

      const modelResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Input Prompt: "${prompt}". Target Generator: "${engine || 'Midjourney'}". Target Language for Tips: "${language || 'ar'}".`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = modelResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } else {
        throw new Error('Empty AI response');
      }
    } catch (error) {
      console.error('AI Optimization Error:', error);
      res.status(500).json({ error: 'Failed to optimize prompt with AI' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAKAN Prompt server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
