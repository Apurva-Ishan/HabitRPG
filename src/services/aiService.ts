import type { AIUserContext } from "@/lib/aiContext";

const PROXY_URL = "http://localhost:3000/api/claude";
const MAX_TOKENS = 2048;

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Weekly Review ────────────────────────────────────────────────────────────

export interface WeeklyReview {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export async function fetchWeeklyReview(
  context: AIUserContext,
): Promise<WeeklyReview | null> {
  const prompt = `You are an expert productivity coach. Analyse this user's habit data and return a weekly review as JSON only — no markdown, no preamble.

User context:
${JSON.stringify(context, null, 2)}

Respond with exactly this shape:
{
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area 1", "area 2"],
  "recommendations": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}`;

  return callClaude<WeeklyReview>(prompt);
}

// ── Habit Suggestions ────────────────────────────────────────────────────────

export interface AIHabitSuggestion {
  name: string;
  description: string;
  category: string;
  frequency: "daily" | "weekly";
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  icon: string;
}

export async function fetchHabitSuggestions(
  context: AIUserContext,
  goal: string,
): Promise<AIHabitSuggestion[] | null> {
  const prompt = `You are an expert productivity coach. Suggest 3 habits for this user based on their goal.

User context:
${JSON.stringify(context, null, 2)}

User's goal: "${goal}"

Return JSON only — no markdown, no preamble. Respond with exactly this shape:
[
  {
    "name": "Habit name",
    "description": "One sentence description",
    "category": "fitness | learning | mindfulness | nutrition | social | other",
    "frequency": "daily | weekly",
    "difficulty": "easy | medium | hard",
    "xpReward": 10 | 20 | 30,
    "icon": "single emoji"
  }
]

Rules:
- xpReward must be exactly 10 (easy), 20 (medium), or 30 (hard)
- Do not suggest habits the user already has
- Match difficulty to the user's preferredDifficulty where appropriate`;

  return callClaude<AIHabitSuggestion[]>(prompt);
}

// ── Quest Suggestions ────────────────────────────────────────────────────────

export interface AIQuestSuggestion {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
}

export async function fetchQuestSuggestions(
  context: AIUserContext,
): Promise<AIQuestSuggestion[] | null> {
  const prompt = `You are an expert productivity coach. Generate 3 daily quests tailored to this user.

User context:
${JSON.stringify(context, null, 2)}

Return JSON only — no markdown, no preamble. Respond with exactly this shape:
[
  {
    "title": "Quest title",
    "description": "One sentence challenge description",
    "difficulty": "easy | medium | hard",
    "xpReward": 15 | 25 | 40
  }
]

Rules:
- xpReward must be exactly 15 (easy), 25 (medium), or 40 (hard)
- Quests should be completable today
- Reference the user's actual habits where possible`;

  return callClaude<AIQuestSuggestion[]>(prompt);
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function fetchChatReply(
  context: AIUserContext,
  history: AIMessage[],
): Promise<string | null> {
  const system = `You are an expert, encouraging productivity coach inside HabitRPG — a gamified habit tracker. You have full access to the user's habit data below.

Be concise, specific, and actionable. Reference the user's actual habits and stats when relevant. Never be generic.

User context:
${JSON.stringify(context, null, 2)}`;

  return callClaudeChat<string>(system, history);
}

// ── Core fetch helpers ───────────────────────────────────────────────────────

async function callClaude<T>(userPrompt: string): Promise<T | null> {
  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "";
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(clean) as T;
  } catch {
    return null;
  }
}

async function callClaudeChat<T extends string>(
  system: string,
  history: AIMessage[],
): Promise<T | null> {
  try {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_tokens: MAX_TOKENS,
        system,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    console.log("proxy status:", res.status);
    const data = await res.json();
    console.log("proxy response:", JSON.stringify(data, null, 2));

    if (!res.ok) return null;
    return (data.content?.[0]?.text ?? null) as T | null;
  } catch (err) {
    console.error("aiService error:", err);
    return null;
  }
}
