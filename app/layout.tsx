import type { Metadata } from "next";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Cherry's Closet",
  description: "Clothing, footwear, bags, and many more online store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ShopProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </ShopProvider>
      </body>
    </html>
  );
}
