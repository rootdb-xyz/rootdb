import type { Metadata } from "next";
import { storeGetList } from "@/lib/store";
import { AdminSubmissionList } from "@/components/admin-submission-list";

export const metadata: Metadata = { title: "Review Device Submissions" };
export const dynamic = "force-dynamic";

export default async function AdminDevicesPage() {
  const submissions = await storeGetList<{
    id: string;
    status: string;
    submitted_at: string;
    display_name: string;
    target_path: string;
    variant_count: number;
    yaml_content: string;
  }>("submissions:devices");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-6">Device Submissions</h1>
      <AdminSubmissionList
        type="devices"
        submissions={submissions.map((s) => ({
          id: s.id,
          status: s.status,
          submitted_at: s.submitted_at,
          title: s.display_name,
          subtitle: `${s.variant_count} variants → ${s.target_path}`,
          content: s.yaml_content,
        }))}
      />
    </div>
  );
}