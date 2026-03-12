import type { MetadataRoute } from "next";
import { getAllDevices, getAllGuides } from "@/lib/data";
import { getAllDownloadEntries } from "@/lib/downloads";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contribute`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/upload`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/submit/device`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/editor`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const devices = getAllDevices().map((d) => ({
    url: `${base}/device/${d.brand_id}/${d.series_id}/${d.codename}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const guides = getAllGuides().map((g) => ({
    url: `${base}/guide/${g.id}`,
    lastModified: g.updated ? new Date(g.updated) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const downloads = getAllDownloadEntries().map((d) => ({
    url: `${base}/download/${d.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...devices, ...guides, ...downloads];
}