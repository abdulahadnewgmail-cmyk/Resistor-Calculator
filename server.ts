import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for photo uploads
  app.use(express.json({ limit: '20mb' }));

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Resistor Image Recognition Endpoint
  app.post('/api/analyze-resistor', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(400).json({
          error: 'GEMINI_API_KEY is not set. Please add GEMINI_API_KEY to your environment/settings.',
        });
        return;
      }

      const { imageBase64, mimeType = 'image/jpeg' } = req.body;
      if (!imageBase64) {
        res.status(400).json({ error: 'imageBase64 string is required.' });
        return;
      }

      // Strip data URL prefix cleanly
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analyze this image of an electronic component (resistor or SMD chip resistor).
Identify the type of resistor, its color bands (from left to right), or its SMD code marking, and compute the resistance value in ohms.

Return strictly valid JSON in the following schema:
{
  "type": "through_hole" or "smd" or "unknown",
  "bandCount": 3 or 4 or 5 or 6,
  "bands": ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white", "gold", "silver"],
  "smdCode": "string e.g. 473 or 1001 or 01B",
  "resistanceOhms": number (e.g. 4700),
  "resistanceFormatted": "string e.g. 4.7 kΩ",
  "tolerance": "string e.g. ±5%",
  "confidence": "high" or "medium" or "low",
  "description": "Brief 1-2 sentence breakdown explaining the identified colors/codes."
}
If no resistor is visible, set "type": "unknown", "confidence": "low", and "description": "No resistor clearly recognized in image."`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      let text = response.text || '';
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            parsed = { error: 'Failed to parse AI response', raw: text };
          }
        } else {
          parsed = { error: 'Failed to parse AI response', raw: text };
        }
      }

      res.json(parsed);
    } catch (err: any) {
      console.error('Error analyzing resistor image:', err);
      res.status(500).json({
        error: 'Failed to analyze resistor image: ' + (err?.message || String(err)),
      });
    }
  });

  // Vite development middleware vs production static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
