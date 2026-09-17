"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";

export default function Header() {
  const { cart } = useShop();
  const pathname = usePathname();
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  const isShop = pathname === "/";
  const isCart = pathname === "/checkout";
  const isOrders = pathname === "/orders";

  // Close the mobile menu automatically whenever the route changes,
  // so it doesn't stay open after tapping a link.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function desktopTabClass(active: boolean) {
    return `relative pb-1 hover:text-gold-100 transition-colors ${
      active
        ? "text-white after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:h-[3px] after:rounded-full after:bg-white"
        : "text-gold-100"
    }`;
  }

  function mobileTabClass(active: boolean) {
    return `block px-4 py-3 text-base font-semibold rounded-lg ${
      active ? "bg-gold-600 text-white" : "text-gold-100 hover:bg-gold-600/50"
    }`;
  }

  const navLinks = [
    { href: "/", label: "Shop", active: isShop },
    { href: "/checkout", label: `Cart${cartCount > 0 ? ` (${cartCount})` : ""}`, active: isCart },
    { href: "/orders", label: "My Orders", active: isOrders },
  ];

  return (
    <header className="bg-gold-500 text-white relative">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white tracking-wide">
            Chery&apos;s
          </span>
          <span className="text-lg font-light italic text-gold-100">
            Closet
          </span>
        </Link>

        {/* Desktop nav, hidden on small screens */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={desktopTabClass(link.active)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger button, only shown on small screens */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-gold-600"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="sm:hidden absolute top-full left-0 right-0 bg-gold-500 border-t border-gold-400 px-4 py-3 space-y-1 shadow-lg z-50">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={mobileTabClass(link.active)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
