import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { mapOrderRow } from "@/lib/mappers";
import type { FulfilmentStatus } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/orders] Failed to load orders:", error.message);

    return NextResponse.json(
      { error: "Could not load orders." },
      { status: 500 }
    );
  }

  return NextResponse.json(data.map(mapOrderRow));
}

export async function PATCH(req: Request) {
  let body: {
    id?: unknown;
    fulfilmentStatus?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { id, fulfilmentStatus } = body;

  if (
    typeof id !== "string" ||
    !id.trim() ||
    (fulfilmentStatus !== "Packaged" &&
      fulfilmentStatus !== "Sent out")
  ) {
    return NextResponse.json(
      { error: "Invalid order status update." },
      { status: 400 }
    );
  }

  const expectedCurrent: FulfilmentStatus =
    fulfilmentStatus === "Packaged" ? "Pending" : "Packaged";

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      fulfilment_status: fulfilmentStatus,
    })
    .eq("id", id)
    .eq("fulfilment_status", expectedCurrent)
    .select("id, fulfilment_status, packaged_at, sent_out_at")
    .maybeSingle();

  if (error) {
    console.error(
      "[admin/orders] Failed to update fulfilment status:",
      error.message
    );

    return NextResponse.json(
      { error: "Could not update order status." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: `Order cannot be changed to ${fulfilmentStatus}. Its current status may have changed already.`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    order: {
      id: data.id,
      fulfilmentStatus: data.fulfilment_status,
      packagedAt: data.packaged_at,
      sentOutAt: data.sent_out_at,
    },
  });
}