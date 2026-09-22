"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_NAV = [
  { href: "/admin", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bundles", label: "Bundle Deals" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (isLoginPage) return <>{children}</>;

  return (
    <div>
      {/* Persistent across every admin section (Products, Orders, Bundle
          Deals, and product create/edit), so navigating between them
          never requires going back to the dashboard first. Scrolls
          horizontally rather than wrapping or squeezing on narrow
          screens, same pattern already used for category chips. */}
      <div className="flex items-center gap-3 mb-4">
        <nav className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 flex-1 min-w-0">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
                  active
                    ? "bg-gold-600 text-white"
                    : "bg-gold-100 text-gold-700 hover:bg-gold-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="shrink-0 text-xs font-semibold text-red-600 border border-red-200 rounded-full px-3 py-1 hover:bg-red-50"
        >
          Log out
        </button>
      </div>
      {children}
    </div>
  );
}
