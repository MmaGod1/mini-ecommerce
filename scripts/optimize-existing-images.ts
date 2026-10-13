import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "product-images";
const BATCH_SIZE = 25;

type Job = {
  imageUrl: string;
  references: {
    table: "products" | "variants";
    id: string;
  }[];
};

function getStoragePath(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}

function getWebpPath(path: string) {
  return path.replace(/\.[^/.]+$/, ".webp");
}

async function main() {
  console.log("Loading products and variants...");

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,image_url")
    .not("image_url", "is", null);

  if (productsError) throw productsError;

  const { data: variants, error: variantsError } = await supabase
    .from("variants")
    .select("id,image_url")
    .not("image_url", "is", null);

  if (variantsError) throw variantsError;

  const jobsMap = new Map<string, Job>();

  for (const row of products ?? []) {
    if (!row.image_url) continue;

    const existing = jobsMap.get(row.image_url);

    if (existing) {
      existing.references.push({ table: "products", id: row.id });
    } else {
      jobsMap.set(row.image_url, {
        imageUrl: row.image_url,
        references: [{ table: "products", id: row.id }],
      });
    }
  }

  for (const row of variants ?? []) {
    if (!row.image_url) continue;

    const existing = jobsMap.get(row.image_url);

    if (existing) {
      existing.references.push({ table: "variants", id: row.id });
    } else {
      jobsMap.set(row.image_url, {
        imageUrl: row.image_url,
        references: [{ table: "variants", id: row.id }],
      });
    }
  }

  const jobs = Array.from(jobsMap.values());

  console.log(`Products: ${products?.length ?? 0}`);
  console.log(`Variants: ${variants?.length ?? 0}`);
  console.log(`Unique images: ${jobs.length}`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);

    for (const job of batch) {
      try {
        const oldPath = getStoragePath(job.imageUrl);

        if (!oldPath) {
          throw new Error(`Invalid Supabase Storage URL: ${job.imageUrl}`);
        }

        if (oldPath.toLowerCase().endsWith(".webp")) {
          skipped++;
          processed++;
          continue;
        }

        const response = await fetch(job.imageUrl);

        if (!response.ok) {
          throw new Error(
            `Download failed: ${response.status} ${response.statusText}`
          );
        }

        const input = Buffer.from(await response.arrayBuffer());

        const optimized = await sharp(input)
          .rotate()
          .resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();

        const newPath = getWebpPath(oldPath);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(newPath, optimized, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(newPath);

        // Update every database row using this image.
        for (const reference of job.references) {
          const { error: updateError } = await supabase
            .from(reference.table)
            .update({ image_url: publicUrl })
            .eq("id", reference.id);

          if (updateError) {
            throw new Error(
              `${reference.table} ${reference.id} update failed: ${updateError.message}`
            );
          }
        }

        // Only delete the original after all references were updated.
        const { error: deleteError } = await supabase.storage
          .from(BUCKET)
          .remove([oldPath]);

        if (deleteError) {
          console.warn(
            `Warning: old file was not deleted: ${deleteError.message}`
          );
        }

        processed++;

        console.log(
          `[${processed}/${jobs.length}] Optimized ${job.imageUrl} (${job.references.length} references)`
        );
      } catch (error) {
        failed++;

        console.error(
          `[FAILED] ${job.imageUrl}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log(
      `Batch complete: ${Math.min(i + BATCH_SIZE, jobs.length)}/${jobs.length}`
    );
  }

  console.log("\nMigration complete.");
  console.log(`Processed: ${processed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Migration stopped:", error);
  process.exit(1);
});