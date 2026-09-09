"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";

export default function Header() {
  const { cart } = useShop();
  const pathname = usePathname();
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const isShop = pathname === "/";
  const isCart = pathname === "/checkout";
  const isOrders = pathname === "/orders";
  const isAdmin = pathname.startsWith("/admin");

  function tabClass(active: boolean) {
    return `relative pb-1 hover:text-gold-100 transition-colors ${
      active
        ? "text-white after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:h-[3px] after:rounded-full after:bg-white"
        : "text-gold-100"
    }`;
  }

  return (
    <header className="bg-gold-500 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-wide">
          YourShop
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/" className={tabClass(isShop)}>
            Shop
          </Link>
          <Link href="/checkout" className={tabClass(isCart)}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
          <Link href="/orders" className={tabClass(isOrders)}>
            My Orders
          </Link>
          <Link href="/admin" className={tabClass(isAdmin)}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
