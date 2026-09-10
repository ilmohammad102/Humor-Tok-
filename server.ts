import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Helper for lazy GenAI
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Humor Tok API',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Comedy Punchline & Script Assistant
  app.post('/api/generate-punchline', async (req, res) => {
    try {
      const { topic, style, length } = req.body;
      const comedyTopic = topic || 'Everyday struggles and relatable fails';
      const comedyStyle = style || 'Stand-up observational comedy';

      const ai = getAIClient();
      if (!ai) {
        // Fallback witty punchlines if no API key is provided
        const fallbacks = [
          {
            title: "The Ultimate Standup Realization",
            punchline: "I told my computer I needed a break, and now it refuses to wake up from sleep mode.",
            caption: "Relatable tech pain 😂 #standup #humortok #fail",
            tags: ["#humortok", "#standup", "#relatable", "#techhumor", "#viral"]
          },
          {
            title: "Gym vs Snack Realities",
            punchline: "I don't sweat at the gym. My body is just crying for chocolate.",
            caption: "Who else signed up for the gym in January and forgot? 💀 #gymcomedy #skit #fitnesshumor",
            tags: ["#gymhumor", "#relatable", "#skit", "#humortok", "#lol"]
          },
          {
            title: "Online Shopping Logic",
            punchline: "Item is $40: Added to cart. Shipping is $4.99: Guess I didn't need to survive after all.",
            caption: "The psychology of free shipping needs to be studied in Harvard 📦 #shoppingmemes #relatable",
            tags: ["#shopping", "#relatable", "#humortok", "#comedy", "#mohammadcomedy"]
          }
        ];
        return res.json({
          ideas: fallbacks,
          source: 'local_humor_engine'
        });
      }

      const prompt = `You are a viral comedy writer for Humor Tok (a TikTok/Instagram Reels comedy platform).
Write 3 hilarious, original, and punchy comedy reel scripts/punchlines about: "${comedyTopic}".
Comedy Style: ${comedyStyle}.
For each one, provide:
1. title: snappy concept name
2. punchline: the killer punchline or visual joke (1-2 sentences)
3. caption: a viral TikTok-style caption with emojis
4. tags: 4-5 trending comedy hashtags (starting with #, include #humortok)

Respond ONLY with valid JSON in this structure:
{
  "ideas": [
    {
      "title": "...",
      "punchline": "...",
      "caption": "...",
      "tags": ["#humortok", "#comedy", "..."]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.9,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (parseErr) {
        console.warn('Failed to parse Gemini JSON, falling back:', responseText);
        return res.json({
          ideas: [
            {
              title: comedyTopic,
              punchline: responseText.slice(0, 180),
              caption: `${comedyTopic} 🤣🔥 #humortok #comedy`,
              tags: ["#humortok", "#comedy", "#viral", "#laugh"]
            }
          ]
        });
      }
    } catch (err: any) {
      console.error('Error generating punchline:', err);
      res.status(500).json({
        error: 'Failed to generate comedy punchline',
        details: err?.message || String(err)
      });
    }
  });

  // Admin / Owner Mohammad stats and platform status
  app.get('/api/admin/stats', (req, res) => {
    res.json({
      owner: {
        name: 'Mohammad',
        role: 'Founder & Head of Comedy',
        badge: '👑 Verified Owner',
        email: 'ilmohammad102@gmail.com',
      },
      stats: {
        totalViews: 3418920,
        totalLikes: 1184320,
        totalReels: 2841,
        totalShares: 492100,
        activeCreators: 834,
        dailyHoursStreamed: 4120,
        viralQuotient: 98.6,
      },
      serverStatus: 'healthy',
      version: '2.4.0-humortok'
    });
  });

  // Vite integration
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
    console.log(`🤣 Humor Tok Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
