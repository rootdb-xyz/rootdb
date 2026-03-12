import Link from "next/link";
import type { Metadata } from "next";
import { Shield, Smartphone, BookOpen, Download, Trash2, Clock } from "lucide-react";
import { storeGetList } from "@/lib/store";

export const metadata: Metadata = { title: "Admin Panel" };

export const dynamic = "force-dynamic"; // Always fresh data

export default async function AdminPage() {
  const [devices, guides, downloads, removals] = await Promise.all([
    storeGetList<{ id: string; status: string; display_name: string; submitted_at: string }>("submissions:devices"),
    storeGetList<{ id: string; status: string; guide_id: string; submitted_at: string }>("submissions:guides"),
    storeGetList<{ id: string; status: string; name: string; submitted_at: string }>("submissions:downloads"),
    storeGetList<{ id: string; status: string; device: { name: string }; reason: string; submitted_at: string }>("submissions:removals"),
  ]);

  const pendingDevices = devices.filter((s) => s.status === "pending");
  const pendingGuides = guides.filter((s) => s.status === "pending");
  const pendingDownloads = downloads.filter((s) => s.status === "pending");
  const pendingRemovals = removals.filter((s) => s.status === "pending");
  const totalPending = pendingDevices.length + pendingGuides.length + pendingDownloads.length + pendingRemovals.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-extrabold mb-8">
        <Shield className="h-8 w-8 text-ctp-red" />
        Mod Panel
        {totalPending > 0 && (
          <span className="rounded-full bg-ctp-red px-3 py-1 text-sm font-bold text-white">
            {totalPending} pending
          </span>
        )}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <QueueCard
          icon={<Smartphone className="h-6 w-6" />}
          title="Device Submissions"
          pending={pendingDevices.length}
          total={devices.length}
          href="/admin/devices"
          color="text-ctp-green"
        />
        <QueueCard
          icon={<BookOpen className="h-6 w-6" />}
          title="Guide Submissions"
          pending={pendingGuides.length}
          total={guides.length}
          href="/admin/guides"
          color="text-ctp-mauve"
        />
        <QueueCard
          icon={<Download className="h-6 w-6" />}
          title="Download Submissions"
          pending={pendingDownloads.length}
          total={downloads.length}
          href="/admin/downloads"
          color="text-ctp-blue"
        />
        <QueueCard
          icon={<Trash2 className="h-6 w-6" />}
          title="Removal Requests"
          pending={pendingRemovals.length}
          total={removals.length}
          href="/admin/removals"
          color="text-ctp-red"
        />
      </div>

      {/* Recent activity */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Recent Pending
        </h2>
        {totalPending === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No pending submissions. 🎉
          </div>
        ) : (
          <div className="space-y-2">
            {[
              ...pendingDevices.map((s) => ({ type: "Device", name: s.display_name, time: s.submitted_at, href: "/admin/devices" })),
              ...pendingGuides.map((s) => ({ type: "Guide", name: s.guide_id, time: s.submitted_at, href: "/admin/guides" })),
              ...pendingDownloads.map((s) => ({ type: "Download", name: s.name, time: s.submitted_at, href: "/admin/downloads" })),
              ...pendingRemovals.map((s) => ({ type: "Removal", name: s.device.name, time: s.submitted_at, href: "/admin/removals" })),
            ]
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              .slice(0, 10)
              .map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-ctp-yellow/15 px-2 py-0.5 text-[10px] font-bold text-ctp-yellow">
                      {item.type}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.time).toLocaleDateString()}
                  </span>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueCard({ icon, title, pending, total, href, color }: {
  icon: React.ReactNode; title: string; pending: number; total: number; href: string; color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary ${color} group-hover:bg-primary/10 transition-colors`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>
      {pending > 0 && (
        <span className="rounded-full bg-ctp-yellow/15 px-2.5 py-1 text-sm font-bold text-ctp-yellow">
          {pending}
        </span>
      )}
    </Link>
  );
}