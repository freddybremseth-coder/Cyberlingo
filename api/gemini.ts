import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { requireActiveAccess } from '../server/supabaseAuth';

const ALLOWED_MODEL = 'gemini-3.6-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await requireActiveAccess(req);

    const providerKey = process.env.AI_PROVIDER_KEY;
    if (!providerKey) {
      return res.status(503).json({ error: 'Server AI is not configured' });
    }

    const { model, contents, config } = req.body || {};
    if (model !== ALLOWED_MODEL) {
      return res.status(400).json({ error: 'Model not allowed' });
    }

    const ai = new GoogleGenAI({ apiKey: providerKey });
    const response = await ai.models.generateContent({
      model: ALLOWED_MODEL,
      contents,
      config,
    });

    res.json({
      text: response.text || '',
      candidates: response.candidates || [],
      usageMetadata: response.usageMetadata || null,
    });
  } catch (err: any) {
    const status = Number(err?.statusCode) || 500;
    console.error('AI proxy error:', err);
    res.status(status).json({
      error: status === 401 ? 'Authentication required' : status === 402 ? 'Active access required' : 'AI request failed',
    });
  }
}
