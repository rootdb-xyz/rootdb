import type { Metadata } from "next";
import { Smartphone } from "lucide-react";
import { DeviceSubmissionForm } from "@/components/device-submission-form";

export const metadata: Metadata = {
  title: "Submit a Device",
  description:
    "Add a new Android device to the RootDB database with variant-level root status.",
};

export default function SubmitDevicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold">Submit a Device</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in what you know. Each variant (model number) is tracked
          separately — Exynos and Snapdragon are different root paths.
        </p>
      </div>

      <DeviceSubmissionForm />
    </div>
  );
}