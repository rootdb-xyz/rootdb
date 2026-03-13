import { getAdminSession, isAdminConfigured } from "@/lib/admin";
import { Shield } from "lucide-react";
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-extrabold">Admin Panel Disabled</h1>
        <p className="mt-2 text-muted-foreground">
          Set <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_GITHUB_IDS</code> in
          your environment to enable the mod panel.
        </p>
      </div>
    );
  }

  const admin = await getAdminSession();
  if (!admin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Shield className="mx-auto h-12 w-12 text-ctp-red mb-4" />
        <h1 className="text-2xl font-extrabold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You must be a signed-in admin to access this page.
        </p>
        <Link href="/api/auth/signin">Sign In</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b bg-ctp-red/5">
        <div className="mx-auto flex h-10 max-w-6xl items-center gap-2 px-4 text-xs">
          <Shield className="h-3.5 w-3.5 text-ctp-red" />
          <span className="font-semibold text-ctp-red">Admin Panel</span>
          <span className="text-muted-foreground">— Signed in as {admin.name}</span>
        </div>
      </div>
      {children}
    </div>
  );
}