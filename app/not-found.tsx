import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-extrabold">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        This page doesn&apos;t exist — maybe the device hasn&apos;t been added yet?
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search Devices
        </Link>
        <Link
          href="/submit/device"
          className="rounded-lg border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Add a Device
        </Link>
      </div>
    </div>
  );
}