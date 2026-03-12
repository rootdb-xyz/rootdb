"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Code, Send, Loader2,
  CheckCircle2, ArrowDown, ArrowUp,
  FileText, GitBranch, Layers, Save, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockDraft {
  id: string;
  title: string;
  content: string;
  warning: string;
  tip: string;
  isNew: boolean;
}

interface BranchDraft {
  answerId: string;
  answerText: string;
  isNewAnswer: boolean;
  injectBlockIds: string[];
  nextQuestionId: string;
}

interface ConditionDraft {
  questionId: string;
  questionText: string;
  questionHelp: string;
  isNewQuestion: boolean;
  branches: BranchDraft[];
}

interface EditorState {
  guideId: string;
  title: string;
  description: string;
  author: string;
  difficulty: string;
  tags: string;
  requiredTools: string;
  blocks: BlockDraft[];
  conditions: ConditionDraft[];
  coreBlockIds: string[];
}

const EMPTY_STATE: EditorState = {
  guideId: "", title: "", description: "", author: "", difficulty: "beginner",
  tags: "", requiredTools: "", blocks: [], conditions: [], coreBlockIds: [],
};

const STORAGE_KEY = "rootdb-guide-editor";

type IdCheckResult = { exists: boolean; data?: Record<string, string>; loading: boolean };

function useIdCheck() {
  const cache = useRef<Record<string, IdCheckResult>>({});
  const [results, setResults] = useState<Record<string, IdCheckResult>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const check = useCallback((type: string, id: string) => {
    const key = `${type}:${id}`;
    if (!id || id.length < 2) return;
    if (cache.current[key] && !cache.current[key].loading) return;

    if (timers.current[key]) clearTimeout(timers.current[key]);
    setResults((prev) => ({ ...prev, [key]: { exists: false, loading: true } }));

    timers.current[key] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-id?type=${type}&id=${encodeURIComponent(id)}`);
        const json = await res.json();
        const result: IdCheckResult = { exists: json.exists, data: json.data ?? undefined, loading: false };
        cache.current[key] = result;
        setResults((prev) => ({ ...prev, [key]: result }));
      } catch {
        const fallback: IdCheckResult = { exists: false, loading: false };
        cache.current[key] = fallback;
        setResults((prev) => ({ ...prev, [key]: fallback }));
      }
    }, 400);
  }, []);

  const get = useCallback(
    (type: string, id: string): IdCheckResult | null => {
      if (!id || id.length < 2) return null;
      return results[`${type}:${id}`] ?? null;
    },
    [results]
  );

  return { check, get };
}

export function GuideEditor() {
  const [s, setS] = useState<EditorState>(EMPTY_STATE);
  const [activeSection, setActiveSection] = useState<string>("meta");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showYaml, setShowYaml] = useState(false);
  const loaded = useRef(false);
  const { check, get } = useIdCheck();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setS(JSON.parse(saved));
    } catch { /* empty */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* empty */ }
  }, [s]);

  const set = <K extends keyof EditorState>(key: K, val: EditorState[K]) =>
    setS((prev) => ({ ...prev, [key]: val }));

  function clearAll() {
    if (confirm("Clear everything? This cannot be undone.")) {
      setS({ ...EMPTY_STATE });
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(false);
    }
  }

  // ── Block operations (immutable) ──
  function addBlock() {
    set("blocks", [...s.blocks, { id: "", title: "", content: "", warning: "", tip: "", isNew: true }]);
  }
  function updateBlock(i: number, updates: Partial<BlockDraft>) {
    set("blocks", s.blocks.map((b, idx) => idx === i ? { ...b, ...updates } : b));
    if (updates.id) check("block", updates.id);
  }
  function removeBlock(i: number) {
    set("blocks", s.blocks.filter((_, idx) => idx !== i));
  }

  // ── Condition operations (immutable) ──
  function addCondition() {
    set("conditions", [
      ...s.conditions,
      { questionId: "", questionText: "", questionHelp: "", isNewQuestion: true, branches: [] },
    ]);
  }
  function updateCondition(i: number, updates: Partial<ConditionDraft>) {
    set("conditions", s.conditions.map((c, idx) => idx === i ? { ...c, ...updates } : c));
    if (updates.questionId) check("question", updates.questionId);
  }
  function removeCondition(i: number) {
    set("conditions", s.conditions.filter((_, idx) => idx !== i));
  }
  function addBranch(ci: number) {
    set("conditions", s.conditions.map((c, idx) =>
      idx === ci
        ? { ...c, branches: [...c.branches, { answerId: "", answerText: "", isNewAnswer: true, injectBlockIds: [], nextQuestionId: "" }] }
        : c
    ));
  }
  function updateBranch(ci: number, bi: number, updates: Partial<BranchDraft>) {
    set("conditions", s.conditions.map((c, cIdx) =>
      cIdx === ci
        ? { ...c, branches: c.branches.map((b, bIdx) => bIdx === bi ? { ...b, ...updates } : b) }
        : c
    ));
    if (updates.answerId) check("answer", updates.answerId);
  }
  function removeBranch(ci: number, bi: number) {
    set("conditions", s.conditions.map((c, idx) =>
      idx === ci ? { ...c, branches: c.branches.filter((_, bIdx) => bIdx !== bi) } : c
    ));
  }

  // ── Core blocks ──
  function addCoreBlock() { set("coreBlockIds", [...s.coreBlockIds, ""]); }
  function updateCoreBlock(i: number, val: string) {
    set("coreBlockIds", s.coreBlockIds.map((b, idx) => idx === i ? val : b));
    if (val) check("block", val);
  }
  function removeCoreBlock(i: number) { set("coreBlockIds", s.coreBlockIds.filter((_, idx) => idx !== i)); }
  function moveCoreBlock(i: number, dir: -1 | 1) {
    const next = [...s.coreBlockIds];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("coreBlockIds", next);
  }

  // ── YAML ──
  function generateGuideYaml(): string {
    const lines: string[] = [];
    lines.push(`id: ${s.guideId || "my-guide"}`);
    lines.push(`title: "${s.title}"`);
    if (s.description) lines.push(`description: "${s.description}"`);
    if (s.author) lines.push(`author: ${s.author}`);
    lines.push(`updated: "${new Date().toISOString().split("T")[0]}"`);
    lines.push(`difficulty: ${s.difficulty}`);
    if (s.tags.trim()) { lines.push("tags:"); s.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => lines.push(`  - ${t}`)); }
    else lines.push("tags: []");
    if (s.requiredTools.trim()) { lines.push("required_tools:"); s.requiredTools.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => lines.push(`  - ${t}`)); }
    if (s.conditions.length > 0) {
      lines.push(""); lines.push("conditions:");
      for (const c of s.conditions) {
        if (!c.questionId) continue;
        lines.push(`  - question_id: ${c.questionId}`);
        lines.push("    branches:");
        for (const b of c.branches) {
          if (!b.answerId) continue;
          lines.push(`      - answer_id: ${b.answerId}`);
          lines.push(b.injectBlockIds.length > 0
            ? `        inject_blocks:\n${b.injectBlockIds.map((bid) => `          - ${bid}`).join("\n")}`
            : "        inject_blocks: []");
          if (b.nextQuestionId) lines.push(`        next_question_id: ${b.nextQuestionId}`);
        }
      }
    }
    lines.push(""); lines.push("core_blocks:");
    const coreIds = s.coreBlockIds.filter(Boolean);
    if (coreIds.length > 0) coreIds.forEach((bid) => lines.push(`  - ${bid}`));
    else lines.push("  []");
    return lines.join("\n");
  }

  function generateNewBlocksYaml(): { id: string; yaml: string }[] {
    return s.blocks.filter((b) => b.isNew && b.id && b.content).map((b) => ({
      id: b.id,
      yaml: [
        `id: ${b.id}`,
        b.title ? `title: "${b.title}"` : "",
        "content: |",
        ...b.content.split("\n").map((l) => `  ${l}`),
        b.warning ? `warning: "${b.warning}"` : "",
        b.tip ? `tip: "${b.tip}"` : "",
      ].filter(Boolean).join("\n"),
    }));
  }

  async function submit() {
    if (!s.guideId) return;
    setSubmitting(true);
    try {
      const newQuestions = s.conditions
        .filter((c) => c.isNewQuestion && c.questionId && c.questionText)
        .map((c) => ({ id: c.questionId, text: c.questionText, help: c.questionHelp }));
      const newAnswers = s.conditions
        .flatMap((c) => c.branches)
        .filter((b) => b.isNewAnswer && b.answerId && b.answerText)
        .map((b) => ({ id: b.answerId, text: b.answerText }));

      const res = await fetch("/api/submit-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide_id: s.guideId,
          guide_yaml: generateGuideYaml(),
          new_blocks: generateNewBlocksYaml(),
          new_questions: newQuestions,
          new_answers: newAnswers,
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch { /* empty */ }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-ctp-green/20 bg-ctp-green/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-ctp-green mb-3" />
        <h2 className="text-xl font-bold text-ctp-green">Guide Submitted!</h2>
        <p className="mt-2 text-muted-foreground">A moderator will review and merge it.</p>
        <button onClick={clearAll} className="mt-4 text-sm text-primary hover:underline">Start a new guide</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Save className="h-3.5 w-3.5" /> Auto-saved to browser
        </div>
        <button onClick={clearAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-ctp-red transition-colors">
          <RotateCcw className="h-3 w-3" /> Clear all
        </button>
      </div>

      {/* ═══ Metadata ═══ */}
      <Section icon={<FileText className="h-4 w-4" />} title="Guide Info" id="meta" active={activeSection} onToggle={setActiveSection}>
        <div className="grid gap-3 sm:grid-cols-2">
          <IdField label="Guide ID" value={s.guideId} onChange={(v) => set("guideId", v)} placeholder="magisk-samsung-exynos" />
          <Field label="Title" value={s.title} onChange={(v) => set("title", v)} placeholder="Root Samsung Exynos with Magisk" required />
        </div>
        <Field label="Description" value={s.description} onChange={(v) => set("description", v)} placeholder="One-liner shown under the title" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Author" value={s.author} onChange={(v) => set("author", v)} placeholder="Your name" />
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select value={s.difficulty} onChange={(e) => set("difficulty", e.target.value)}
              className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Field label="Tags (comma-sep)" value={s.tags} onChange={(v) => set("tags", v)} placeholder="magisk, samsung" />
        </div>
        <Field label="Required Tools (comma-sep)" value={s.requiredTools} onChange={(v) => set("requiredTools", v)} placeholder="magisk_app, odin" />
      </Section>

      {/* ═══ Blocks ═══ */}
      <Section icon={<Layers className="h-4 w-4" />} title={`Blocks (${s.blocks.length})`} id="blocks" active={activeSection} onToggle={setActiveSection}>
        <p className="text-sm text-muted-foreground mb-3">
          Create blocks for this guide. Type an ID to check if it already exists.
        </p>
        {s.blocks.map((block, i) => {
          const status = get("block", block.id);
          const existsInDb = status?.exists === true && !status.loading;
          return (
            <div key={i} className={cn("rounded-lg border p-4 space-y-3 mb-3", existsInDb ? "border-ctp-green/30 bg-ctp-green/5" : "border-border")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Block {i + 1}</span>
                <button onClick={() => removeBlock(i)} className="text-muted-foreground hover:text-ctp-red"><Trash2 className="h-4 w-4" /></button>
              </div>
              <IdField label="Block ID" value={block.id} onChange={(v) => updateBlock(i, { id: v })} placeholder="oem_unlock_legacy" status={status} />
              {existsInDb && status?.data && (
                <div className="rounded-lg bg-ctp-green/10 border border-ctp-green/20 p-3">
                  <p className="text-xs font-semibold text-ctp-green mb-1">✓ Exists in database</p>
                  {status.data.title && <p className="text-sm font-medium">{String(status.data.title)}</p>}
                  {status.data.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{String(status.data.content)}</p>}
                  <button onClick={() => updateBlock(i, { isNew: false })} className="mt-2 text-xs text-primary hover:underline">
                    Use existing (don&apos;t create new)
                  </button>
                </div>
              )}
              {(block.isNew && !existsInDb) && (
                <>
                  <Field label="Title" value={block.title} onChange={(v) => updateBlock(i, { title: v })} placeholder="Step title" />
                  <div>
                    <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                    <textarea value={block.content} onChange={(e) => updateBlock(i, { content: e.target.value })}
                      placeholder="Markdown content — NO step numbers…" rows={6}
                      className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none resize-y" />
                  </div>
                  <Field label="Warning" value={block.warning} onChange={(v) => updateBlock(i, { warning: v })} placeholder="Red callout" />
                  <Field label="Tip" value={block.tip} onChange={(v) => updateBlock(i, { tip: v })} placeholder="Green callout" />
                </>
              )}
            </div>
          );
        })}
        <button onClick={addBlock} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus className="h-4 w-4" /> Add Block
        </button>
      </Section>

      {/* ═══ Decision Tree ═══ */}
      <Section icon={<GitBranch className="h-4 w-4" />} title={`Decision Tree (${s.conditions.length})`} id="tree" active={activeSection} onToggle={setActiveSection}>
        <p className="text-sm text-muted-foreground mb-3">Optional. Ask users questions and inject blocks based on answers.</p>
        {s.conditions.map((cond, ci) => {
          const qStatus = get("question", cond.questionId);
          return (
            <div key={ci} className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Condition {ci + 1}</span>
                <button onClick={() => removeCondition(ci)} className="text-muted-foreground hover:text-ctp-red"><Trash2 className="h-4 w-4" /></button>
              </div>
              <IdField label="Question ID" value={cond.questionId} onChange={(v) => updateCondition(ci, { questionId: v })} placeholder="q_android_version" status={qStatus} />
              {qStatus?.exists && qStatus.data && (
                <div className="rounded bg-ctp-green/10 px-3 py-2 text-xs">
                  <span className="text-ctp-green font-medium">✓ Exists:</span> {String(qStatus.data.text ?? "")}
                </div>
              )}
              {(!qStatus?.exists || cond.isNewQuestion) && (
                <>
                  <Field label="Question Text" value={cond.questionText} onChange={(v) => updateCondition(ci, { questionText: v })} placeholder="What Android version?" />
                  <Field label="Help Text" value={cond.questionHelp} onChange={(v) => updateCondition(ci, { questionHelp: v })} placeholder="Settings → …" />
                </>
              )}
              <div className="pl-4 border-l-2 border-primary/20 space-y-3 mt-3">
                {cond.branches.map((br, bi) => {
                  const aStatus = get("answer", br.answerId);
                  return (
                    <div key={bi} className="rounded-lg border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Branch {bi + 1}</span>
                        <button onClick={() => removeBranch(ci, bi)} className="text-muted-foreground hover:text-ctp-red"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <IdField label="Answer ID" value={br.answerId} onChange={(v) => updateBranch(ci, bi, { answerId: v })} placeholder="ans_android12_below" status={aStatus} />
                      {aStatus?.exists && aStatus.data && (
                        <div className="rounded bg-ctp-green/10 px-2 py-1 text-xs">
                          <span className="text-ctp-green">✓</span> {String(aStatus.data.text ?? "")}
                        </div>
                      )}
                      {(!aStatus?.exists || br.isNewAnswer) && (
                        <Field label="Answer Text" value={br.answerText} onChange={(v) => updateBranch(ci, bi, { answerText: v })} placeholder="Android 12 or lower" />
                      )}
                      <div>
                        <label className="block text-xs font-medium mb-1">Inject Block IDs (comma-sep)</label>
                        <input value={br.injectBlockIds.join(", ")}
                          onChange={(e) => updateBranch(ci, bi, { injectBlockIds: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                          placeholder="oem_unlock_legacy, knox_warning"
                          className="w-full rounded-lg border bg-secondary px-3 py-1.5 text-sm font-mono focus:border-primary focus:outline-none" />
                      </div>
                      <IdField label="→ Next Question ID" value={br.nextQuestionId} onChange={(v) => updateBranch(ci, bi, { nextQuestionId: v })} placeholder="q_oneui_version" status={get("question", br.nextQuestionId)} />
                    </div>
                  );
                })}
                <button onClick={() => addBranch(ci)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Add Branch
                </button>
              </div>
            </div>
          );
        })}
        <button onClick={addCondition} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus className="h-4 w-4" /> Add Condition
        </button>
      </Section>

      {/* ═══ Core Blocks ═══ */}
      <Section icon={<Layers className="h-4 w-4" />} title={`Core Blocks (${s.coreBlockIds.filter(Boolean).length})`} id="core" active={activeSection} onToggle={setActiveSection}>
        <p className="text-sm text-muted-foreground mb-3">Always render after injected blocks, in this order.</p>
        {s.coreBlockIds.map((bid, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
            <input value={bid} onChange={(e) => updateCoreBlock(i, e.target.value)} placeholder="block_id"
              className="flex-1 rounded-lg border bg-secondary px-3 py-1.5 font-mono text-sm focus:border-primary focus:outline-none" />
            <IdBadge status={get("block", bid)} />
            <button onClick={() => moveCoreBlock(i, -1)} disabled={i === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button onClick={() => moveCoreBlock(i, 1)} disabled={i === s.coreBlockIds.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
            <button onClick={() => removeCoreBlock(i)} className="p-1 text-muted-foreground hover:text-ctp-red"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <button onClick={addCoreBlock} className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2">
          <Plus className="h-4 w-4" /> Add Core Block
        </button>
      </Section>

      {/* ═══ YAML Preview ═══ */}
      <div className="rounded-xl border bg-card p-5">
        <button onClick={() => setShowYaml((p) => !p)} className="flex w-full items-center justify-between text-left">
          <h3 className="flex items-center gap-2 font-semibold"><Code className="h-4 w-4 text-primary" /> YAML Preview</h3>
          {showYaml ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showYaml && (
          <div className="mt-4 space-y-4">
            <pre className="overflow-x-auto rounded-lg bg-secondary p-4 text-xs font-mono leading-relaxed">{generateGuideYaml()}</pre>
            {generateNewBlocksYaml().map((b) => (
              <div key={b.id}>
                <p className="text-xs text-muted-foreground mb-1">data/blocks/{b.id}.yml</p>
                <pre className="overflow-x-auto rounded-lg bg-secondary p-3 text-xs font-mono leading-relaxed">{b.yaml}</pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={submit} disabled={!s.guideId || !s.title || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        Submit Guide for Review
      </button>
    </div>
  );
}

// ═══ Sub-components ═══

function Section({ icon, title, id, active, onToggle, children }: {
  icon: React.ReactNode; title: string; id: string; active: string; onToggle: (id: string) => void; children: React.ReactNode;
}) {
  const isOpen = active === id;
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button onClick={() => onToggle(isOpen ? "" : id)} className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-accent/50 transition-colors">
        <h2 className="flex items-center gap-2 font-semibold">{icon}{title}</h2>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-ctp-red ml-0.5">*</span>}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border bg-secondary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}

function IdField({ label, value, onChange, placeholder, status }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; status?: IdCheckResult | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="flex-1 rounded-lg border bg-secondary px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        {status !== undefined && <IdBadge status={status ?? null} />}
      </div>
    </div>
  );
}

function IdBadge({ status }: { status: IdCheckResult | null }) {
  if (!status) return null;
  if (status.loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />;
  if (status.exists) return <span className="shrink-0 rounded-full bg-ctp-green/15 px-2 py-0.5 text-[10px] font-bold text-ctp-green">EXISTS</span>;
  return <span className="shrink-0 rounded-full bg-ctp-yellow/15 px-2 py-0.5 text-[10px] font-bold text-ctp-yellow">NEW</span>;
}