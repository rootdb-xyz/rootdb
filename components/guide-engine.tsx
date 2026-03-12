"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guide, Question, Answer, Block } from "@/lib/types";

/* ── Internal state: one answered question ── */
interface AnswerStep {
  questionId: string;
  answerId: string;
  injectedBlocks: string[];
}

interface GuideEngineProps {
  guide: Guide;
  questions: Record<string, Question>;
  answers: Record<string, Answer>;
  blocks: Record<string, Block>;
}

export function GuideEngine({
  guide,
  questions,
  answers,
  blocks,
}: GuideEngineProps) {
  const hasConditions = !!guide.conditions?.length;

  const [steps, setSteps] = useState<AnswerStep[]>([]);
  const [currentQId, setCurrentQId] = useState<string | null>(
    hasConditions ? guide.conditions![0].question_id : null
  );
  const [phase, setPhase] = useState<"asking" | "complete">(
    hasConditions ? "asking" : "complete"
  );

  // ── Find a condition node by question ID ──
  const findCond = (qid: string) =>
    guide.conditions?.find((c) => c.question_id === qid);

  // ── Handle an answer selection ──
  function pick(answerId: string) {
    if (!currentQId) return;
    const cond = findCond(currentQId);
    if (!cond) return;
    const branch = cond.branches.find((b) => b.answer_id === answerId);
    if (!branch) return;

    setSteps((prev) => [
      ...prev,
      {
        questionId: currentQId,
        answerId,
        injectedBlocks: branch.inject_blocks,
      },
    ]);

    if (branch.next_question_id) {
      setCurrentQId(branch.next_question_id);
    } else {
      setCurrentQId(null);
      setPhase("complete");
    }
  }

  // ── Go back to re-answer a specific step ──
  function goBack(index: number) {
    const target = steps[index];
    setSteps((prev) => prev.slice(0, index));
    setCurrentQId(target.questionId);
    setPhase("asking");
  }

  // ── Full reset ──
  function reset() {
    setSteps([]);
    setCurrentQId(hasConditions ? guide.conditions![0].question_id : null);
    setPhase(hasConditions ? "asking" : "complete");
  }

  // ── Build final ordered block list ──
  const finalBlockIds = useMemo(
    () => [...steps.flatMap((s) => s.injectedBlocks), ...guide.core_blocks],
    [steps, guide.core_blocks]
  );

  const currentQ = currentQId ? questions[currentQId] : null;
  const currentCond = currentQId ? findCond(currentQId) : null;

  return (
    <div className="space-y-8">
      {/* ════ Guide header ════ */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {guide.title}
        </h1>
        {guide.description && (
          <p className="mt-2 text-muted-foreground">{guide.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {guide.difficulty && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                guide.difficulty === "beginner" &&
                  "bg-ctp-green/15 text-ctp-green",
                guide.difficulty === "intermediate" &&
                  "bg-ctp-yellow/15 text-ctp-yellow",
                guide.difficulty === "advanced" &&
                  "bg-ctp-red/15 text-ctp-red"
              )}
            >
              {guide.difficulty}
            </span>
          )}
          {guide.author && (
            <span className="text-sm text-muted-foreground">
              by {guide.author}
            </span>
          )}
          {guide.updated && (
            <span className="text-sm text-muted-foreground">
              • {guide.updated}
            </span>
          )}
        </div>
      </header>

      {/* ════ Previous answers (clickable to go back) ════ */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Configuration
          </h3>
          <div className="flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => goBack(i)}
                className="group flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary/50"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-ctp-green" />
                <span className="text-muted-foreground">
                  {questions[s.questionId]?.text ?? s.questionId}:
                </span>
                <span className="font-semibold">
                  {answers[s.answerId]?.text ?? s.answerId}
                </span>
                <span className="ml-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  change
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════ Question phase ════ */}
      {phase === "asking" && currentQ && currentCond && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
          <h2 className="text-lg font-semibold">{currentQ.text}</h2>
          {currentQ.help && (
            <p className="mt-1 text-sm text-muted-foreground">
              {currentQ.help}
            </p>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {currentCond.branches.map((br) => {
              const ans = answers[br.answer_id];
              if (!ans) return null;
              return (
                <button
                  key={br.answer_id}
                  onClick={() => pick(br.answer_id)}
                  className="flex items-center gap-3 rounded-lg border-2 border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
                >
                  <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
                  <span className="font-medium">{ans.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ Rendered guide steps ════ */}
      {phase === "complete" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {finalBlockIds.length} Step
              {finalBlockIds.length !== 1 ? "s" : ""}
            </h2>
            {hasConditions && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start Over
              </button>
            )}
          </div>

          {finalBlockIds.map((bid, idx) => {
            const block = blocks[bid];
            if (!block)
              return (
                <div
                  key={bid}
                  className="rounded-lg border border-ctp-yellow/30 bg-ctp-yellow/5 p-4 text-sm text-ctp-yellow"
                >
                  ⚠ Missing block: <code>{bid}</code>
                </div>
              );

            return (
              <article
                key={bid}
                className="overflow-hidden rounded-xl border bg-card"
              >
                {/* Step header bar */}
                <div className="flex items-center gap-3 border-b bg-secondary/30 px-5 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold">
                    {block.title ?? `Step ${idx + 1}`}
                  </h3>
                </div>

                <div className="space-y-4 p-5">
                  {/* Warning callout */}
                  {block.warning && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-ctp-red/20 bg-ctp-red/10 p-3">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-ctp-red mt-0.5" />
                      <p className="text-sm text-ctp-red">{block.warning}</p>
                    </div>
                  )}

                  {/* Markdown body */}
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {block.content}
                    </ReactMarkdown>
                  </div>

                  {/* Tip callout */}
                  {block.tip && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-ctp-green/20 bg-ctp-green/10 p-3">
                      <Lightbulb className="h-4 w-4 shrink-0 text-ctp-green mt-0.5" />
                      <p className="text-sm text-ctp-green">{block.tip}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}