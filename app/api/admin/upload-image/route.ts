import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { dataUrl, fileName } = await req.json();

  if (!dataUrl || !fileName) {
    return NextResponse.json({ error: "Missing file data" }, { status: 400 });
  }

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;

  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
