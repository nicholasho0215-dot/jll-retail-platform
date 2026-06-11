import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Settings2, X, KeyRound, Server } from "lucide-react";
import { answerLocally } from "@/lib/localAnswer";
import { askClaude, describeError, getStoredKey, storeKey, clearKey, type ChatTurn } from "@/lib/claude";
import { backendChat, getBackendUrl, setBackendUrl, getAccessCode, setAccessCode } from "@/lib/backend";
import { buildMarketContext } from "@/lib/marketContext";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const suggestions = [
  "What's the latest retail news?",
  "What's available at Suntec City?",
  "Any new F&B openings in Singapore?",
  "Compare Orchard vs Jurong East",
];

const marketContext = buildMarketContext();

export function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Morning! I'm your market assistant — ask me about rents, vacancy, available units, store movements, news or the pipeline. Connect a Claude API key in settings (⚙) for full AI answers.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(() => getStoredKey());
  const [serverUrl, setServerUrl] = useState<string>(() => getBackendUrl());
  const [showSettings, setShowSettings] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [urlDraft, setUrlDraft] = useState(() => getBackendUrl());
  const [codeDraft, setCodeDraft] = useState(() => getAccessCode());
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);

    const history: ChatTurn[] = [...messages, { role: "user" as const, text: q }].map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text: q }]);

    if (serverUrl) {
      // Server agent — full analyst with live news DB + web search
      setMessages((m) => [...m, { role: "assistant", text: "" }]);
      try {
        const reply = await backendChat(history, marketContext);
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: reply || "Done." }]);
      } catch (err) {
        const note = err instanceof Error && err.message === "ACCESS_CODE"
          ? "The intelligence server rejected the access code — check it in settings (⚙)."
          : "Couldn't reach the intelligence server. Falling back to the built-in engine for this answer.";
        const fallback = answerLocally(q);
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: `⚠️ ${note}\n\n${fallback}` }]);
      }
    } else if (apiKey) {
      // Direct Claude with the user's own key — stream the reply in place
      setMessages((m) => [...m, { role: "assistant", text: "" }]);
      try {
        let acc = "";
        const full = await askClaude(apiKey, history, (delta) => {
          acc += delta;
          const snapshot = acc;
          setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: snapshot }]);
        });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: full || acc }]);
      } catch (err) {
        const note = describeError(err);
        const fallback = answerLocally(q);
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: `⚠️ ${note}\n\n${fallback}` }]);
      }
    } else {
      // Built-in engine
      await new Promise((r) => setTimeout(r, 450));
      setMessages((m) => [...m, { role: "assistant", text: answerLocally(q) }]);
    }
    setBusy(false);
  };

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    storeKey(k);
    setApiKey(k);
    setKeyDraft("");
    setShowSettings(false);
    setMessages((m) => [...m, { role: "assistant", text: "Claude connected ✓ — I'll now answer with full AI, grounded in the platform data. Your key stays in this browser only." }]);
  };

  const removeKey = () => {
    clearKey();
    setApiKey(null);
    setShowSettings(false);
    setMessages((m) => [...m, { role: "assistant", text: "Claude disconnected — back to the built-in engine." }]);
  };

  const saveServer = () => {
    setBackendUrl(urlDraft);
    setAccessCode(codeDraft);
    const next = getBackendUrl();
    setServerUrl(next);
    setShowSettings(false);
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        text: next
          ? "Intelligence server connected ✓ — answers now come from the live agent (news database + web search + platform data)."
          : "Intelligence server removed — using " + (apiKey ? "your Claude key." : "the built-in engine."),
      },
    ]);
  };

  return (
    <Card className="rounded-xl max-w-3xl mx-auto flex flex-col h-[calc(100dvh-330px)] lg:h-[calc(100dvh-280px)] min-h-[380px]">
      <CardContent className="flex flex-col flex-1 min-h-0 pt-4">
        {/* Mode bar */}
        <div className="flex items-center gap-2 pb-3 border-b border-border/60">
          <span className={cn("h-2 w-2 rounded-full", serverUrl ? "bg-emerald-500" : apiKey ? "bg-amber-500" : "bg-slate-300")} />
          <span className="text-[11.5px] font-bold">
            {serverUrl ? "Live intelligence server" : apiKey ? "Claude (your key)" : "Built-in engine"}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
            {serverUrl
              ? "news database · live web search · platform data"
              : apiKey
                ? "Claude answers grounded in platform data"
                : "keyword engine — connect the server or Claude in ⚙"}
          </span>
          <button
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Assistant settings"
            className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {showSettings ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
          </button>
        </div>

        {showSettings && (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 mt-3 space-y-2.5">
            <div className="flex items-center gap-2 text-[12.5px] font-bold">
              <Server className="h-3.5 w-3.5 text-primary" />
              Intelligence server (recommended)
            </div>
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              The Railway-hosted Retail Pulse API — live news feed, web search and the full AI analyst
              for everyone, no API key needed. Paste the server URL (and access code if one is set).
            </p>
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://your-service.up.railway.app"
              className="rounded-lg h-9 text-[12.5px] font-mono"
            />
            <div className="flex gap-2">
              <Input
                type="password"
                value={codeDraft}
                onChange={(e) => setCodeDraft(e.target.value)}
                placeholder="Access code (if set)"
                className="rounded-lg h-9 text-[12.5px] font-mono"
              />
              <Button onClick={saveServer} className="rounded-lg h-9 text-[12px] font-bold">
                Save
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[12.5px] font-bold pt-2 border-t border-border/60">
              <KeyRound className="h-3.5 w-3.5 text-primary" />
              Anthropic API key (fallback)
            </div>
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              Paste your own key (console.anthropic.com → API keys) to upgrade the assistant to real Claude AI.
              It's stored only in this browser's localStorage and sent only to Anthropic — never to this site's
              repo or any other server. Usage is billed to your Anthropic account (typically &lt; US$0.05 per question).
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                placeholder="sk-ant-…"
                className="rounded-lg h-9 text-[12.5px] font-mono"
              />
              <Button onClick={saveKey} disabled={!keyDraft.trim()} className="rounded-lg h-9 text-[12px] font-bold">
                Connect
              </Button>
            </div>
            {apiKey && (
              <button onClick={removeKey} className="text-[11.5px] font-semibold text-rose-600 hover:underline">
                Disconnect & forget key
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pt-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center mr-2.5 shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-foreground text-background rounded-br-md"
                    : "bg-muted/70 rounded-bl-md"
                }`}
              >
                {m.text || <span className="text-muted-foreground">thinking…</span>}
              </div>
            </div>
          ))}
          {busy && !apiKey && (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3 text-[13px] text-muted-foreground">
                thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3">
          {suggestions.map((sg) => (
            <button
              key={sg}
              onClick={() => send(sg)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {sg}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={serverUrl || apiKey ? "Ask anything — market, news, research…" : "Ask about rents, vacancy, units, store moves…"}
            className="rounded-xl h-11 text-[13.5px]"
          />
          <Button onClick={() => send()} disabled={busy} size="icon" className="rounded-xl h-11 w-11 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
