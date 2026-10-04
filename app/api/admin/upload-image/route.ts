import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { dataUrl, fileName } = await req.json();

    if (!dataUrl || !fileName) {
      return NextResponse.json(
        { error: "Missing file data" },
        { status: 400 }
      );
    }

    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(matches[2], "base64");

    const optimizedBuffer = await sharp(buffer)
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const baseName = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const path = `${Date.now()}-${baseName}.webp`;

    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, optimizedBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      { error: "Image processing or upload failed" },
      { status: 500 }
    );
  }
}