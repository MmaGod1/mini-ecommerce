import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Category name required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .upsert({ name: name.trim() }, { onConflict: "name" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
