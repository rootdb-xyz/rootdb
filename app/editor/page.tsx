import type { Metadata } from "next";
import { PenTool } from "lucide-react";
import { GuideEditor } from "@/components/guide-editor";

export const metadata: Metadata = {
  title: "Editor",
  description: "Create guides, blocks, and decision trees for the RootDB database.",
};

export default function EditorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <PenTool className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold">Guide Editor</h1>
        </div>
        <p className="text-muted-foreground">
          Build interactive root guides with decision trees. Create blocks inline.
          Everything auto-saves to your browser.
        </p>
      </div>

      <GuideEditor />
    </div>
  );
}