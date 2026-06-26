import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json());

// Lazy-loaded GoogleGenAI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Please add your Gemini API key in Settings > Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Decision helper API endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { title, context, analysisType, options = [] } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Decision title is required.' });
    }

    const ai = getGeminiClient();

    let systemInstruction = 'You are "The Tiebreaker", an elite strategic decision analysis AI. Your job is to analyze decisions objectively, cut through analysis paralysis, and provide highly structured, mathematically balanced, and insightful breakdowns. Be realistic, balanced, and highly contextual. Avoid fluffy generic answers.';
    let prompt = '';
    let responseSchema: any = null;

    if (analysisType === 'pros_cons') {
      const optionsStr = options.length > 0 ? options.join(', ') : 'the binary choice of doing it versus not doing it';
      prompt = `
Analyze the decision: "${title}"
Context / constraints: ${context || 'None provided'}
Options to analyze: ${optionsStr}

Provide a comprehensive pros and cons analysis. For each option, list 3-5 major pros and 3-5 major cons.
Assign weights to pros (from 1 = low benefit to 5 = extreme benefit) and cons (from 1 = minor issue to 5 = fatal flaw/risk).
Assign each pro/con a clear logical category (e.g., Financial, Career, Time, Emotion, Risk, health).
Ensure each pro/con has a concise 1-2 sentence explanation of why it applies specifically to this option.
Finally, provide a clear recommended path (the Tiebreaker Verdict), a synthesis summary, and a confidence score from 1-100 indicating how clear-cut the decision is.
`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          optionsAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                optionName: { type: Type.STRING },
                pros: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: 'Unique simple ID like pro_1, pro_2' },
                      text: { type: Type.STRING, description: 'Short pro title (e.g., "Potential Higher Income")' },
                      category: { type: Type.STRING },
                      weight: { type: Type.INTEGER, description: 'Importance rating from 1 to 5' },
                      explanation: { type: Type.STRING, description: 'Brief contextual description' }
                    },
                    required: ['id', 'text', 'category', 'weight', 'explanation']
                  }
                },
                cons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: 'Unique simple ID like con_1, con_2' },
                      text: { type: Type.STRING, description: 'Short con title (e.g., "High Upfront Investment")' },
                      category: { type: Type.STRING },
                      weight: { type: Type.INTEGER, description: 'Severity rating from 1 to 5' },
                      explanation: { type: Type.STRING, description: 'Brief contextual description' }
                    },
                    required: ['id', 'text', 'category', 'weight', 'explanation']
                  }
                }
              },
              required: ['optionName', 'pros', 'cons']
            }
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              summary: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER }
            },
            required: ['recommendation', 'summary', 'confidenceScore']
          }
        },
        required: ['optionsAnalysis', 'verdict']
      };

    } else if (analysisType === 'swot') {
      prompt = `
Perform a detailed SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for this decision/strategy: "${title}"
Context / constraints: ${context || 'None provided'}

Provide a rigorous SWOT evaluation. For each of the 4 quadrants (Strengths, Weaknesses, Opportunities, Threats), list 3-5 key elements.
For each element, assign an impact score from 1 (minor impact) to 5 (massive critical impact).
Include a clear, contextual explanation for each.
Finally, deliver an expert strategic tiebreaker verdict: recommend whether to proceed, how to mitigate the major threats/weaknesses, and point out the single most actionable strategic takeaway.
`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'e.g. s_1, s_2' },
                text: { type: Type.STRING },
                impact: { type: Type.INTEGER, description: '1 to 5' },
                explanation: { type: Type.STRING }
              },
              required: ['id', 'text', 'impact', 'explanation']
            }
          },
          weaknesses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'e.g. w_1, w_2' },
                text: { type: Type.STRING },
                impact: { type: Type.INTEGER, description: '1 to 5' },
                explanation: { type: Type.STRING }
              },
              required: ['id', 'text', 'impact', 'explanation']
            }
          },
          opportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'e.g. o_1, o_2' },
                text: { type: Type.STRING },
                impact: { type: Type.INTEGER, description: '1 to 5' },
                explanation: { type: Type.STRING }
              },
              required: ['id', 'text', 'impact', 'explanation']
            }
          },
          threats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'e.g. t_1, t_2' },
                text: { type: Type.STRING },
                impact: { type: Type.INTEGER, description: '1 to 5' },
                explanation: { type: Type.STRING }
              },
              required: ['id', 'text', 'impact', 'explanation']
            }
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyActionableTakeaway: { type: Type.STRING }
            },
            required: ['recommendation', 'summary', 'keyActionableTakeaway']
          }
        },
        required: ['strengths', 'weaknesses', 'opportunities', 'threats', 'verdict']
      };

    } else if (analysisType === 'comparison') {
      const optionsStr = options.length > 2 ? options.join(', ') : 'Options under consideration';
      prompt = `
Perform a detailed comparison matrix across multiple evaluation criteria for: "${title}"
Context / constraints: ${context || 'None provided'}
Options to compare: ${optionsStr}

Identify 4-6 highly relevant, specific evaluation criteria (e.g., Upfront Cost, Maintenance, Career Growth, Personal Satisfaction, Time Required).
For each criterion, define it, assign an importance weight from 1 to 5, and then score each option on a scale of 1 (poor) to 5 (excellent) under this criterion.
Provide a clear explanation of why each rating was assigned.
Provide a final structured verdict, indicating which option is mathematically/strategically superior (taking criteria weights into consideration), a general summary, and a direct trade-off comparison summary sentence.
`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Criterion name (e.g., Cost, Flexibility, Future Outlook)' },
                description: { type: Type.STRING, description: 'Definition of what this is measuring in this context' },
                weight: { type: Type.INTEGER, description: 'Importance of this factor from 1 to 5' }
              },
              required: ['name', 'description', 'weight']
            }
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          matrix: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterionName: { type: Type.STRING },
                ratings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      optionName: { type: Type.STRING },
                      rating: { type: Type.INTEGER, description: 'Score from 1 (poor) to 5 (excellent)' },
                      explanation: { type: Type.STRING, description: 'Contextual explanation for this rating' }
                    },
                    required: ['optionName', 'rating', 'explanation']
                  }
                }
              },
              required: ['criterionName', 'ratings']
            }
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              summary: { type: Type.STRING },
              directComparisonSummary: { type: Type.STRING }
            },
            required: ['recommendation', 'summary', 'directComparisonSummary']
          }
        },
        required: ['criteria', 'options', 'matrix', 'verdict']
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from Gemini.');
    }

    const parsedResult = JSON.parse(text.trim());
    return res.json(parsedResult);

  } catch (error: any) {
    console.error('Error generating analysis:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during generation.' });
  }
});

// Configure Vite middleware in development or static asset serving in production
async function startServer() {
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
    console.log(`[The Tiebreaker] Server is running on http://localhost:${PORT}`);
  });
}

startServer();
