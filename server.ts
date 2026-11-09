import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini initialization
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Clean and extract human-friendly error messages from Gemini API errors
function formatGeminiError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';

  let rawMessage = err.message || String(err);

  // Check if rawMessage is a JSON string
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed?.error?.message) {
      rawMessage = parsed.error.message;
    }
  } catch {
    // not JSON
  }

  if (
    rawMessage.includes('503') ||
    rawMessage.includes('high demand') ||
    rawMessage.includes('UNAVAILABLE') ||
    rawMessage.includes('overloaded')
  ) {
    return 'The model is currently experiencing high global demand. Spikes are usually brief—please click Retry in a few seconds.';
  }

  if (rawMessage.includes('429') || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }

  return rawMessage;
}

// Robust execution with exponential backoff and model fallbacks
async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    tools?: any[];
  }
) {
  // Allowed models from gemini-api SKILL.md:
  // Primary: 'gemini-3.8-flash'
  // Fallbacks: 'gemini-flash-latest', 'gemini-3.1-flash-lite'
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (let m = 0; m < modelsToTry.length; m++) {
    const model = modelsToTry[m];
    // Try up to 2 attempts per model with backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        const isTemporary =
          errStr.includes('503') ||
          errStr.includes('high demand') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED');

        console.warn(`[Gemini] Model ${model} attempt ${attempt} failed:`, errStr);

        if (isTemporary && attempt < 2) {
          // Wait 1.2s before retry
          await new Promise((res) => setTimeout(res, 1200));
        } else {
          // Break to try next fallback model
          break;
        }
      }
    }
  }

  throw lastError;
}

const SYSTEM_PROMPT = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.
OPERATIONAL CONSTRAINTS:
 * You must always prioritize token efficiency. Ensure your total analysis and tool execution stays well under 25,000 tokens.
 * If a paper is too long to ingest entirely, use the Web Search tool to look up summaries, abstracts, and open-source implementations (e.g., GitHub) of the paper's title to gather context efficiently.
When a user provides a research paper URL or topic, execute these steps:
 * CORE CONCEPT EXTRACTION:
   Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.
 * ARCHITECTURAL FLOWCHART (Mermaid.js):
   Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper. Do not use Markdown code blocks inside the Mermaid string itself; output it as a clear text segment labeled [FLOWCHART].
 * FUTURE WORK & INTERNSHIP OPPORTUNITIES:
   Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project. For each idea provide:
 * The exact extension (e.g., "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment").
 * The targeted performance metric (e.g., latency reduction, accuracy trade-off).
 * The recommended tech stack (e.g., PyTorch, ONNX Runtime).`;

// Main Paper Analysis endpoint
app.post('/api/analyze-paper', async (req: Request, res: Response) => {
  try {
    const { paperInput, paperType = 'url' } = req.body;

    if (!paperInput || typeof paperInput !== 'string' || !paperInput.trim()) {
      return res.status(400).json({ error: 'Please provide a valid paper URL, title, or abstract.' });
    }

    const ai = getGeminiClient();

    const promptText = `
You are analyzing the following computer science academic paper query:
Input (${paperType}): "${paperInput.trim()}"

Please thoroughly analyze this paper adhering strictly to your system prompt and operational constraints.
Use Google Search if needed to find the actual paper details, arXiv abstract, GitHub repositories, architecture details, and benchmarks.

Format your response as a valid JSON object matching this structure:
{
  "paperTitle": "Official Title of the Paper",
  "authorsAndYear": "Authors / Institution / Year if identifiable",
  "arxivIdOrUrl": "arXiv ID or primary canonical URL",
  "coreConcept": {
    "problemStatement": "Clear summary of the core limitation or challenge being tackled",
    "primaryMethodology": "The key novel architectural, algorithmic, or training mechanism introduced",
    "breakthroughs": "Key mathematical formulations, theoretical bounds, or algorithmic innovations",
    "conciseSummary": "Accessible summary strictly under 300 words synthesizing problem, method, and breakthrough"
  },
  "mermaidFlowchart": "graph TD\\n  subgraph Inputs\\n    ...\\n  end\\n  ...",
  "rawOutput": "The complete verbatim text output containing CORE CONCEPT EXTRACTION, [FLOWCHART] <mermaid_code_without_backticks>, and FUTURE WORK & INTERNSHIP OPPORTUNITIES as specified in the system prompt.",
  "studentOpportunities": [
    {
      "id": 1,
      "title": "Concise Project Title (e.g. Edge-Mamba Compression)",
      "extension": "The exact extension (e.g., Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment)",
      "targetedMetric": "The targeted performance metric (e.g., 3.2x latency reduction on Raspberry Pi / FP16 with <1.5% accuracy loss)",
      "techStack": "The recommended tech stack (e.g., PyTorch, ONNX Runtime, TensorRT)",
      "difficulty": "Intermediate (Junior CS Student)",
      "implementationRoadmap": [
        "Step 1: Profile existing baseline using PyTorch profiler",
        "Step 2: Swap designated layer with custom module",
        "Step 3: Evaluate on benchmark dataset & measure latency"
      ],
      "resumeBullet": "Engineered a lightweight variant of [Paper System] using [Tech Stack], achieving [Target Metric] on commodity edge hardware."
    },
    {
      "id": 2,
      "title": "Project Title 2",
      "extension": "Exact extension",
      "targetedMetric": "Targeted metric",
      "techStack": "Recommended tech stack",
      "difficulty": "Intermediate / Advanced",
      "implementationRoadmap": ["Step 1", "Step 2", "Step 3"],
      "resumeBullet": "Resume bullet formulation"
    },
    {
      "id": 3,
      "title": "Project Title 3",
      "extension": "Exact extension",
      "targetedMetric": "Targeted metric",
      "techStack": "Recommended tech stack",
      "difficulty": "Advanced",
      "implementationRoadmap": ["Step 1", "Step 2", "Step 3"],
      "resumeBullet": "Resume bullet formulation"
    }
  ],
  "architectureHighlights": [
    {
      "component": "Component name (e.g., Selective State Space Module / Multi-Head Latent Attention)",
      "role": "What it does in the dataflow",
      "tensorShapeOrFlow": "e.g., [Batch, SeqLen, D_model] -> [Batch, SeqLen, D_state]"
    }
  ],
  "tokenEfficiencyStats": {
    "estimatedPromptTokens": 1200,
    "estimatedCompletionTokens": 1850,
    "totalTokensUsed": 3050,
    "budgetLimit": 25000,
    "status": "Token efficient (well under 25,000 threshold)"
  }
}

CRITICAL RULES FOR MERMAID:
- Ensure the Mermaid string is syntactically clean 'graph TD'.
- Avoid special characters like quotes or parentheses inside node labels unless properly escaped (e.g., use nodeA["Text with (details)"] or simple node IDs).
- Clearly define inputs, processing stages/layers, and outputs.
- In 'rawOutput', ensure it outputs the segment labeled [FLOWCHART] as requested in the operational prompt.
`;

    const response = await generateContentWithFallback(ai, {
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;

    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback: extract json from code block if wrapped
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse analysis response from model.');
      }
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    const friendlyError = formatGeminiError(error);
    return res.status(500).json({
      error: friendlyError,
    });
  }
});

// Project Starter Kit Generation Endpoint
app.post('/api/generate-starter-kit', async (req: Request, res: Response) => {
  try {
    const { paperTitle, opportunity } = req.body;

    if (!opportunity) {
      return res.status(400).json({ error: 'Missing project opportunity details.' });
    }

    const ai = getGeminiClient();

    const prompt = `
You are generating a complete, production-ready Student Project Starter Kit for a 3rd-year CS student.
Paper: "${paperTitle || 'Academic Paper'}"
Project Title: "${opportunity.title}"
Extension: "${opportunity.extension}"
Target Metric: "${opportunity.targetedMetric}"
Tech Stack: "${opportunity.techStack}"

Generate a complete, ready-to-run project repository scaffold for this student project.
Provide:
1. "readmeMarkdown": A polished README.md with project overview, architecture extension diagram explanation, quickstart guide, benchmarking plan, and how to cite the original paper.
2. "modelCode": Clean, runnable Python code implementing the core model extension (e.g. PyTorch module with comments explaining tensor shapes and modifications).
3. "benchmarkCode": Clean Python script for benchmarking latency, memory footprint, and parameter count against baseline.
4. "requirementsTxt": Python dependencies (e.g. torch, onnx, etc.).
5. "colabLinkAdvice": 3-step instructions for running on Google Colab free tier with GPU acceleration.

Return response as valid JSON:
{
  "readmeMarkdown": "...",
  "modelCode": "...",
  "benchmarkCode": "...",
  "requirementsTxt": "...",
  "colabAdvice": "..."
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, starterKit: parsed });
  } catch (err: any) {
    console.error('Error creating starter kit:', err);
    return res.status(500).json({ error: formatGeminiError(err) });
  }
});

// Interactive Research Assistant Q&A for the paper
app.post('/api/ask-paper', async (req: Request, res: Response) => {
  try {
    const { paperTitle, paperSummary, question, history = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question.' });
    }

    const ai = getGeminiClient();

    const prompt = `
You are an expert Computer Science Professor and Principal Research Scientist advising a 3rd-year student on the paper: "${paperTitle}".
Context of the paper:
${paperSummary || 'Referenced academic work'}

Previous discussion:
${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}

Student's question: "${question}"

Provide a clear, mathematically sound yet accessible explanation with code snippets, mathematical intuition, or architecture diagrams if relevant. Keep it rigorous and encouraging for an undergraduate CS researcher.
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
    });

    return res.json({ success: true, answer: response.text });
  } catch (err: any) {
    console.error('Error in Q&A:', err);
    return res.status(500).json({ error: formatGeminiError(err) });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
