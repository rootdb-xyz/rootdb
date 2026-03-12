import type { Metadata } from "next";
import { LinkIcon } from "lucide-react";
import { FileSubmissionForm } from "@/components/file-submission-form";

export const metadata: Metadata = {
  title: "Submit Download Links",
  description:
    "Submit mirror links for root tools, ROMs, and firmware to the RootDB download database.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <LinkIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold">Submit Download Links</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your file to free hosts first, then paste the links below.
          Need to upload?{" "}
          <a href="/upload" className="text-primary hover:underline">
            Go to the uploader
          </a>
          .
        </p>
      </div>

      <FileSubmissionForm />
    </div>
  );
}