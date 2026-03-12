import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>
          {siteConfig.name} is open-source &amp; community-driven.{" "}
          <a
            href={siteConfig.github.siteRepoUrl}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contribute on GitHub
          </a>
        </p>
        <div className="flex gap-4">
          <Link href="/submit" className="hover:text-foreground transition-colors">
            Upload
          </Link>
          <Link href="/contribute" className="hover:text-foreground transition-colors">
            Contribute
          </Link>
          <a
            href={siteConfig.github.issuesUrl}
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report Bug
          </a>
        </div>
      </div>
    </footer>
  );
}