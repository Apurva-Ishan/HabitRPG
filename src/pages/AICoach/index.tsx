import { useState, useTransition, useRef, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useHabitStore } from "@/stores/useHabitStore";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { buildAIContext } from "@/lib/aiContext";
import {
  fetchChatReply,
  fetchHabitSuggestions,
  type AIMessage,
  type AIHabitSuggestion,
} from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import type { HabitCategory } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set<HabitCategory>([
  "health", "fitness", "learning", "mindfulness", "creativity", "social", "custom",
]);

function sanitiseCategory(raw: string): HabitCategory {
  return VALID_CATEGORIES.has(raw as HabitCategory)
    ? (raw as HabitCategory)
    : "custom";
}

function defaultTarget(difficulty: string): string {
  return difficulty === "easy" ? "1 time" : difficulty === "medium" ? "3 times" : "5 times";
}

// ── Chat tab ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm your AI coach. I can see your habits, streaks, and progress. Ask me anything — what to focus on, how to break a slump, or just for a pep talk.",
};

function ChatTab() {
  const { user } = useUserStore();
  const { habits } = useHabitStore();
  const { achievements, getTodaysQuests } = useGamificationStore();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);

    const history: AIMessage[] = [
      ...messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    const context = buildAIContext(user, habits, achievements, getTodaysQuests());

    startTransition(async () => {
      const reply = await fetchChatReply(context, history);
      if (reply === null) {
        toast.error("Coach is unavailable. Is the proxy running?");
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <ScrollArea className="flex-1 rounded-md border p-4">
        <div className="space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-muted-foreground">
                <span className="animate-pulse">Coach is thinking…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <textarea
          className="flex-1 min-h-[44px] max-h-32 resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Ask your coach…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={isPending || input.trim().length === 0}
          className="self-end"
        >
          Send
        </Button>
      </div>
    </>
  );
}

// ── Suggestions tab ───────────────────────────────────────────────────────────

function SuggestionsTab() {
  const { user } = useUserStore();
  const { habits, addHabit } = useHabitStore();
  const { achievements, getTodaysQuests } = useGamificationStore();

  const [goal, setGoal] = useState("");
  const [suggestions, setSuggestions] = useState<AIHabitSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();

  function handleFetch() {
    const trimmed = goal.trim();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      const context = buildAIContext(user, habits, achievements, getTodaysQuests());
      const result = await fetchHabitSuggestions(context, trimmed);
      if (!result) {
        toast.error("Failed to get suggestions. Is the proxy running?");
        return;
      }
      setSuggestions(result);
      setDismissed(new Set());
    });
  }

  function handleAccept(s: AIHabitSuggestion, index: number) {
    addHabit({
      name: s.name,
      description: s.description,
      category: sanitiseCategory(s.category),
      frequency: s.frequency,
      difficulty: s.difficulty,
      xpReward: s.xpReward,
      icon: s.icon,
      target: defaultTarget(s.difficulty),
    });
    setDismissed((prev) => new Set(prev).add(index));
    toast.success(`"${s.name}" added to your habits!`);
  }

  function handleDismiss(index: number) {
    setDismissed((prev) => new Set(prev).add(index));
  }

  const visible = suggestions.filter((_, i) => !dismissed.has(i));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Describe a goal and get 3 personalised habit suggestions. You decide what to add.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. I want to get fitter and sleep better"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          disabled={isPending}
        />
        <Button
          onClick={handleFetch}
          disabled={isPending || goal.trim().length === 0}
        >
          {isPending ? "Thinking…" : "Suggest"}
        </Button>
      </div>

      {visible.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s, i) =>
            dismissed.has(i) ? null : (
              <div
                key={i}
                className="rounded-lg border bg-card p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                        {s.difficulty}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                        {s.frequency}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        +{s.xpReward} XP
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(s, i)}>
                    Add habit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(i)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {suggestions.length > 0 && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          All suggestions handled.{" "}
          <button
            className="underline underline-offset-2"
            onClick={handleFetch}
          >
            Generate more
          </button>
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "chat" | "suggestions";

export default function AICoach() {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] max-w-2xl mx-auto p-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="text-sm text-muted-foreground">
          Powered by Gemini · context-aware · your data stays local
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["chat", "suggestions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "chat" ? "Chat" : "Habit Suggestions"}
          </button>
        ))}
      </div>

      {tab === "chat" ? <ChatTab /> : <SuggestionsTab />}
    </div>
  );
}