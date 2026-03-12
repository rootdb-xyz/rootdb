import { auth, authConfigured } from "@/auth";

// Comma-separated GitHub user IDs in env
// Find yours at: https://api.github.com/users/YOUR_USERNAME → "id" field
const ADMIN_IDS = (process.env.ADMIN_GITHUB_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export interface AdminSession {
  userId: string;
  name: string;
  image?: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!authConfigured) return null;

  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (ADMIN_IDS.length === 0) return null;
    if (!ADMIN_IDS.includes(session.user.id)) return null;

    return {
      userId: session.user.id,
      name: session.user.name ?? "Admin",
      image: session.user.image ?? undefined,
    };
  } catch {
    return null;
  }
}

export function isAdminConfigured(): boolean {
  return ADMIN_IDS.length > 0;
}