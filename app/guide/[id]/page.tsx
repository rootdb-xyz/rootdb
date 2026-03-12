import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getGuide,
  getAllGuides,
  getBlock,
  getQuestions,
  getAnswers,
} from "@/lib/data";
import { GuideEngine } from "@/components/guide-engine";
import { VotePanel } from "@/components/vote-panel";
import { ChevronRight, Cpu } from "lucide-react";
import type { Guide, Block } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ model?: string; codename?: string }>;
}

export async function generateStaticParams() {
  return getAllGuides().map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guide = getGuide(id);
  if (!guide) return { title: "Guide Not Found" };
  return {
    title: guide.title,
    description: guide.description ?? `Interactive guide: ${guide.title}`,
  };
}

function collectAllBlockIds(guide: Guide): string[] {
  const ids = new Set<string>();
  guide.core_blocks.forEach((b) => ids.add(b));
  guide.conditions?.forEach((c) =>
    c.branches.forEach((br) => br.inject_blocks.forEach((b) => ids.add(b)))
  );
  return Array.from(ids);
}

export default async function GuidePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { model, codename } = await searchParams;
  const guide = getGuide(id);
  if (!guide) notFound();

  const questions = getQuestions();
  const answers = getAnswers();

  const blockIds = collectAllBlockIds(guide);
  const blocks: Record<string, Block> = {};
  for (const bid of blockIds) {
    const b = getBlock(bid);
    if (b) blocks[bid] = b;
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Cpu className="h-5 w-5 text-primary" />
            <span>Root<span className="text-primary">DB</span></span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{guide.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 space-y-12">
        <GuideEngine
          guide={guide}
          questions={questions}
          answers={answers}
          blocks={blocks}
        />

        {/* Vote panel — shows when user arrives from a specific variant */}
        {model && codename && (
          <VotePanel
            guideId={id}
            variantModel={model}
            deviceCodename={codename}
          />
        )}
      </div>
    </div>
  );
}