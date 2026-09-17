"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { Variant, DiscountTier, Product } from "@/lib/types";
import { uploadImage } from "@/lib/uploadImage";

type VariantRow = {
  id?: string;
  color: string;
  size: string;
  price: string;
  stock: string;
  imageUrl?: string; // existing photo URL, already uploaded
  imageFile?: File; // newly picked photo, not uploaded yet
  imagePreview?: string; // what to show right now (existing or local preview)
};
type TierRow = { minQty: string; discountPercent: string };

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toVariantRows(product?: Product): VariantRow[] {
  if (!product) return [{ color: "", size: "", price: "", stock: "" }];
  return product.variants.map((v) => ({
    id: v.id,
    color: v.color,
    size: v.size ?? "",
    price: String(v.price),
    stock: String(v.stock),
    imageUrl: v.imageUrl,
    imagePreview: v.imageUrl,
  }));
}

function toTierRows(product?: Product): TierRow[] {
  if (!product?.discountTiers || product.discountTiers.length === 0) {
    return [{ minQty: "", discountPercent: "" }];
  }
  return product.discountTiers.map((t) => ({
    minQty: String(t.minQty),
    discountPercent: String(t.discountPercent),
  }));
}

export default function ProductForm({
  existingProduct,
}: {
  existingProduct?: Product;
}) {
  const { addProduct, updateProduct, deleteProduct, categories } = useShop();
  const router = useRouter();
  const isEditing = Boolean(existingProduct);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const variantImageInputRefs = useRef<Record<number, HTMLInputElement | null>>(
    {}
  );

  const [name, setName] = useState(existingProduct?.name ?? "");
  const [category, setCategory] = useState(
    existingProduct?.category ?? categories[0] ?? ""
  );
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [description, setDescription] = useState(
    existingProduct?.description ?? ""
  );

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    existingProduct?.imageUrl ?? null
  );
  const [mainImageRemoved, setMainImageRemoved] = useState(false);

  const [variants, setVariants] = useState<VariantRow[]>(
    toVariantRows(existingProduct)
  );
  const [useDiscount, setUseDiscount] = useState(
    Boolean(existingProduct?.discountTiers?.length)
  );
  const [tiers, setTiers] = useState<TierRow[]>(toTierRows(existingProduct));
  const [saving, setSaving] = useState(false);

  function updateVariant(
    i: number,
    field: keyof VariantRow,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v))
    );
  }

  function updateTier(i: number, field: keyof TierRow, value: string) {
    setTiers((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t))
    );
  }

  function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setMainImageRemoved(false);
  }

  function handleRemoveMainImage() {
    setMainImageFile(null);
    setMainImagePreview(null);
    setMainImageRemoved(true);
  }

  function handleVariantImageChange(
    i: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateVariant(i, "imageFile", file);
    updateVariant(i, "imagePreview", URL.createObjectURL(file));
  }

  function confirmNewCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddingCategory(false);
      return;
    }
    setCategory(trimmed);
    setNewCategoryName("");
    setAddingCategory(false);
  }

  async function handleDelete() {
    if (!existingProduct) return;
    const confirmed = window.confirm(
      `Delete "${existingProduct.name}"? This can't be undone.`
    );
    if (!confirmed) return;
    setSaving(true);
    await deleteProduct(existingProduct.id);
    router.push("/admin");
  }

  async function handleSubmit() {
    const finalCategory = addingCategory ? newCategoryName.trim() : category;

    if (
      !name.trim() ||
      !finalCategory ||
      variants.some((v) => !v.color || !v.price)
    ) {
      alert(
        "Please fill in product name, category, and every colour's price."
      );
      return;
    }

    setSaving(true);
    try {
      let finalMainImageUrl: string | undefined = existingProduct?.imageUrl;
      if (mainImageFile) {
        finalMainImageUrl = await uploadImage(mainImageFile);
      } else if (mainImageRemoved) {
        finalMainImageUrl = undefined;
      }

      const productVariants: Variant[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        let variantImageUrl = v.imageUrl;
        if (v.imageFile) {
          variantImageUrl = await uploadImage(v.imageFile);
        }
        productVariants.push({
          id: v.id ?? `${slugify(name)}-${slugify(v.color)}-${slugify(v.size || String(i))}`,
          color: v.color,
          size: v.size.trim() || undefined,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          imageUrl: variantImageUrl,
        });
      }

      let discountTiers: DiscountTier[] | undefined = undefined;
      if (useDiscount) {
        const validTiers = tiers
          .filter((t) => t.minQty && t.discountPercent)
          .map((t) => ({
            minQty: Number(t.minQty),
            discountPercent: Number(t.discountPercent),
          }));
        if (validTiers.length > 0) discountTiers = validTiers;
      }

      const product: Product = {
        id: existingProduct?.id ?? `p-${Date.now()}`,
        slug: existingProduct?.slug ?? slugify(name),
        name,
        category: finalCategory,
        description,
        imageUrl: finalMainImageUrl,
        variants: productVariants,
        discountTiers,
      };

      if (isEditing) {
        await updateProduct(product);
      } else {
        await addProduct(product);
      }
      router.push("/admin");
    } catch (err) {
      alert(
        "Something went wrong saving the product: " +
          (err instanceof Error ? err.message : "unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-ink-900">
          {isEditing ? `Edit ${existingProduct?.name}` : "Add New Product"}
        </h1>
        {isEditing && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
          >
            Delete Product
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg card-shadow p-5 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Product Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
              placeholder="e.g. Ankara Print Sneakers"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gold-700 mb-1">
              Category
            </label>
            {addingCategory ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmNewCategory()}
                  placeholder="New category name"
                  className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
                <button
                  onClick={confirmNewCategory}
                  className="px-3 rounded-lg bg-gold-600 text-white text-sm font-semibold"
                >
                  Add
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setAddingCategory(true)}
                  className="px-3 rounded-lg border border-gold-400 text-gold-700 text-sm font-semibold whitespace-nowrap hover:bg-gold-50"
                >
                  + New
                </button>
              </div>
            )}
            <p className="text-xs text-ink-500 mt-1">
              Not seeing the right category? Click "+ New" to add one, e.g.
              "Caps" or "Accessories".
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gold-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500 resize-none"
            placeholder="Short description customers will see"
          />
        </div>

        {/* Main product image */}
        <div>
          <label className="block text-sm font-semibold text-gold-700 mb-1">
            Main Product Photo
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => mainImageInputRef.current?.click()}
              className="w-28 h-28 rounded-lg border-2 border-dashed border-gold-400 bg-gold-50 flex flex-col items-center justify-center text-gold-600 hover:bg-gold-100 overflow-hidden"
            >
              {mainImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <span className="text-2xl leading-none">&#8593;</span>
                  <span className="text-xs mt-1">Upload photo</span>
                </>
              )}
            </button>
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="hidden"
            />
            {mainImagePreview && (
              <button
                onClick={handleRemoveMainImage}
                className="text-xs text-red-600 hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Shown on the shop grid and as the default photo. Give a colour
            its own photo below if it looks meaningfully different.
          </p>
        </div>

        {/* Colour variants, each with optional own photo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gold-700">
              Colours, Stock &amp; Photos
            </label>
            <button
              onClick={() =>
                setVariants((prev) => [
                  ...prev,
                  { color: "", size: "", price: "", stock: "" },
                ])
              }
              className="text-xs font-semibold text-gold-600 hover:underline"
            >
              + Add colour
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="bg-gold-50 rounded-lg p-3 grid grid-cols-[3.5rem_1fr] gap-3"
              >
                <button
                  type="button"
                  onClick={() => variantImageInputRefs.current[i]?.click()}
                  className="w-14 h-14 rounded-md border-2 border-dashed border-gold-400 bg-white flex items-center justify-center overflow-hidden shrink-0"
                  title="Optional photo for this colour"
                >
                  {v.imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.imagePreview}
                      alt={v.color}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gold-500 text-lg">&#8593;</span>
                  )}
                </button>
                <input
                  ref={(el) => {
                    variantImageInputRefs.current[i] = el;
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleVariantImageChange(i, e)}
                  className="hidden"
                />

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(i, "color", e.target.value)
                      }
                      placeholder="Colour"
                      className="rounded-lg bg-white border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                    />
                    <input
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(i, "size", e.target.value)
                      }
                      placeholder="Size (optional)"
                      className="rounded-lg bg-white border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(i, "price", e.target.value)
                      }
                      placeholder="Price (₦)"
                      type="number"
                      className="rounded-lg bg-white border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                    />
                    <div className="flex gap-2">
                      <input
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(i, "stock", e.target.value)
                        }
                        placeholder="Stock"
                        type="number"
                        className="w-full rounded-lg bg-white border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                      />
                      {variants.length > 1 && (
                        <button
                          onClick={() =>
                            setVariants((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-red-600 text-sm font-bold"
                        title="Remove colour"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Each colour tracks its own stock. A colour's photo is optional,
            leave it blank to use the main product photo.
          </p>
        </div>

        {/* Quantity discount, optional */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gold-700 mb-2">
            <input
              type="checkbox"
              checked={useDiscount}
              onChange={(e) => setUseDiscount(e.target.checked)}
            />
            Enable quantity discount for this product (optional)
          </label>

          {useDiscount && (
            <div className="space-y-2">
              {tiers.map((t, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <input
                    value={t.minQty}
                    onChange={(e) => updateTier(i, "minQty", e.target.value)}
                    placeholder="Buy this many or more"
                    type="number"
                    className="col-span-2 rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      value={t.discountPercent}
                      onChange={(e) =>
                        updateTier(i, "discountPercent", e.target.value)
                      }
                      placeholder="% off"
                      type="number"
                      className="w-full rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-sm outline-none focus:border-gold-500"
                    />
                    {tiers.length > 1 && (
                      <button
                        onClick={() =>
                          setTiers((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-red-600 text-sm font-bold"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  setTiers((prev) => [
                    ...prev,
                    { minQty: "", discountPercent: "" },
                  ])
                }
                className="text-xs font-semibold text-gold-600 hover:underline"
              >
                + Add another tier
              </button>
              <p className="text-xs text-ink-500">
                Example: 5+ = 8% off, 10+ = 15% off. Thresholds are entirely
                up to you per product.
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3 rounded-full font-bold text-white bg-gold-600 hover:bg-gold-700 disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Save Product"}
        </button>
      </div>
    </div>
  );
}
