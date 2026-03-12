import Link from "next/link";
import { Cpu, Shield } from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";
import { auth, authConfigured } from "@/auth";
import { isAdminConfigured } from "@/lib/admin";

const NAV_LINKS = [
  { href: "/search", label: "Browse" },
  { href: "/editor", label: "Editor" },
  { href: "/upload", label: "Upload" },
  { href: "/contribute", label: "Contribute" },
];

export async function Navbar() {
  let user: { name?: string | null; image?: string | null; id?: string } | null = null;
  let isAdmin = false;

  if (authConfigured) {
    try {
      const session = await auth();
      if (session?.user) {
        user = { name: session.user.name, image: session.user.image, id: session.user.id };
        // Check admin
        if (isAdminConfigured() && user.id) {
          const adminIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map((s) => s.trim());
          isAdmin = adminIds.includes(user.id);
        }
      }
    } catch { /* empty */ }
  }

  const links = isAdmin
    ? [...NAV_LINKS, { href: "/admin", label: "Admin" }]
    : NAV_LINKS;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Cpu className="h-5 w-5 text-primary" />
          <span>Root<span className="text-primary">DB</span></span>
        </Link>

        <div className="hidden sm:flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.href === "/admin"
                  ? "flex items-center gap-1 text-ctp-red hover:text-ctp-red/80 transition-colors"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {link.href === "/admin" && <Shield className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
          <UserMenu user={user} authConfigured={authConfigured} />
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <UserMenu user={user} authConfigured={authConfigured} />
          <MobileNav links={links} />
        </div>
      </div>
    </nav>
  );
}