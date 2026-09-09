"use client";

import { useParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products } = useShop();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <p className="text-ink-700">Product not found.</p>;
  }

  return <ProductForm existingProduct={product} />;
}
