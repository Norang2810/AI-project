const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const MODEL_NAME = 'gemini-1.5-flash';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getGeminiModel = () => {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }

  return client.getGenerativeModel({ model: MODEL_NAME });
};

const tryParseMenuArray = (rawText) => {
  if (!rawText) {
    return null;
  }

  const trimmed = rawText.trim().replace(/^```json\s*/i, '').replace(/```$/i, '');

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const normalized = parsed
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 15);

    return normalized.length > 0 ? normalized : null;
  } catch (error) {
    return null;
  }
};

const extractQuotedMenus = (rawText) => {
  const matches = [...rawText.matchAll(/["']([^"'\n]{1,50})["']/g)];
  const items = matches
    .map((match) => match[1].trim())
    .filter(Boolean)
    .slice(0, 15);

  return items.length > 0 ? items : null;
};

const extractLineSeparatedMenus = (rawText) => {
  const items = rawText
    .split('\n')
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(
      (line) =>
        line &&
        line.length <= 50 &&
        !line.startsWith('[') &&
        !line.startsWith('{') &&
        !line.includes('```')
    )
    .slice(0, 15);

  return items.length > 0 ? items : null;
};

const extractTokenMenus = (rawText) => {
  const tokens =
    rawText.match(/[0-9A-Za-z\u3131-\uD79D]{2,}/g)?.filter(Boolean).slice(0, 15) ||
    [];

  return tokens.length > 0 ? tokens : null;
};

const normalizeEnhancedText = (rawText, fallbackText) => {
  const normalizedRaw = String(rawText || '').trim();
  const jsonArray = tryParseMenuArray(normalizedRaw);
  if (jsonArray) {
    return {
      enhancedText: JSON.stringify(jsonArray),
      transformationMethod: 'json_array',
    };
  }

  const quotedMenus = extractQuotedMenus(normalizedRaw);
  if (quotedMenus) {
    return {
      enhancedText: JSON.stringify(quotedMenus),
      transformationMethod: 'quoted_texts',
    };
  }

  const lineSeparatedMenus = extractLineSeparatedMenus(normalizedRaw);
  if (lineSeparatedMenus) {
    return {
      enhancedText: JSON.stringify(lineSeparatedMenus),
      transformationMethod: 'line_separated',
    };
  }

  const tokenMenus = extractTokenMenus(normalizedRaw);
  if (tokenMenus) {
    return {
      enhancedText: JSON.stringify(tokenMenus),
      transformationMethod: 'meaningful_tokens',
    };
  }

  return {
    enhancedText: JSON.stringify([String(fallbackText || '').trim()].filter(Boolean)),
    transformationMethod: 'fallback_original',
  };
};

router.post('/enhance', async (req, res) => {
  try {
    const { prompt, text, maxTokens = 500 } = req.body;

    if (!prompt || !text) {
      return res.status(400).json({
        success: false,
        error: 'prompt and text are required',
      });
    }

    const model = getGeminiModel();
    if (!model) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured',
      });
    }

    let retryCount = 0;
    let rawResponse = '';

    while (retryCount < MAX_RETRIES) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0,
            topP: 0.1,
            topK: 1,
            candidateCount: 1,
          },
        });

        rawResponse = (await result.response).text().trim();
        if (!rawResponse) {
          throw new Error('Empty response');
        }

        break;
      } catch (error) {
        retryCount += 1;

        if (retryCount >= MAX_RETRIES) {
          throw new Error(`Gemini request failed after ${MAX_RETRIES} attempts: ${error.message}`);
        }

        const delay = BASE_DELAY_MS * Math.pow(2, retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const normalized = normalizeEnhancedText(rawResponse, text);

    return res.json({
      success: true,
      enhancedText: normalized.enhancedText,
      originalResponse: rawResponse,
      transformationMethod: normalized.transformationMethod,
    });
  } catch (error) {
    console.error('Gemini enhance failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Gemini request failed',
      details: error.message,
    });
  }
});

router.get('/status', async (req, res) => {
  try {
    const model = getGeminiModel();
    if (!model) {
      return res.json({
        success: false,
        status: 'API_KEY_MISSING',
        message: 'Gemini API key is not configured',
      });
    }

    await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      generationConfig: { maxOutputTokens: 10 },
    });

    return res.json({
      success: true,
      status: 'ACTIVE',
      message: 'Gemini API is available',
      model: MODEL_NAME,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini status check failed:', error);

    return res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Gemini API status check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
